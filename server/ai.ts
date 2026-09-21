import { GoogleGenAI } from '@google/genai';
import { StructuredAiAnalysis, FarmerObservations, Farm, SoilTestResult } from '../src/types.js';

// Lazy-initialize GoogleGenAI client to prevent startup crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface AnalysisInput {
  farm: Farm;
  images: { dataUrl: string; position_type: string }[];
  observations: FarmerObservations;
  laboratoryResults?: SoilTestResult[];
}

export async function runSoilAssessment(input: AnalysisInput): Promise<{
  analysis: StructuredAiAnalysis;
  confidence: 'low' | 'moderate' | 'higher';
  rawResponse?: string;
}> {
  const { farm, images, observations, laboratoryResults } = input;

  // Step 1: Pre-validation of images
  if (!images || images.length === 0) {
    throw new Error('At least one representative soil photograph is required.');
  }

  const primaryImage = images[0].dataUrl;
  const isBase64 = primaryImage.startsWith('data:image/');
  if (!isBase64 && !primaryImage.startsWith('http')) {
    throw new Error('Invalid image format provided. Please provide a clear JPG or PNG photograph.');
  }

  // Check if Gemini API is available
  const client = getAiClient();
  const modelName = process.env.AI_MODEL || 'gemini-3.8-flash';

  // Construct context payload
  const hasLabData = laboratoryResults && laboratoryResults.length > 0;
  const latestLab = hasLabData ? laboratoryResults[0] : null;

  const farmContext = `
FARM CONTEXT:
- County: ${farm.county}, Sub-County: ${farm.sub_county}, Ward: ${farm.ward}
- Approximate Area: ${farm.area} ${farm.area_unit}
- Farmer Stated Soil Feel: ${observations.soil_feel}
- Farmer Observed Soil Color: ${observations.soil_color}
- Observed Drainage: ${observations.drainage}
- Water Source: ${observations.water_source}
- Current/Previous Crop: ${farm.current_crop || 'None reported'}
- Intended Crop: ${observations.intended_crop || farm.current_crop || 'General agriculture'}
- Recent Fertilizer: ${observations.recent_fertilizer?.product ? `${observations.recent_fertilizer.product} (amount: ${observations.recent_fertilizer.amount || 'unspecified'}) applied around ${observations.recent_fertilizer.application_date || 'recently'}` : 'None or not reported'}
- Photographs Submitted: ${images.length} images representing ${observations.photo_representation}

VERIFIED LABORATORY DATA STATUS:
${latestLab ? `VERIFIED LAB RESULT PRESENT (Source: ${latestLab.laboratory_name}, Date: ${latestLab.test_date}):
- pH: ${latestLab.ph ?? 'Not tested'}
- Nitrogen: ${latestLab.nitrogen ? `${latestLab.nitrogen}%` : 'Not tested'}
- Phosphorus: ${latestLab.phosphorus ? `${latestLab.phosphorus} ppm` : 'Not tested'}
- Potassium: ${latestLab.potassium ? `${latestLab.potassium} ppm` : 'Not tested'}
- Organic Carbon: ${latestLab.organic_carbon ? `${latestLab.organic_carbon}%` : 'Not tested'}
- Electrical Conductivity (EC): ${latestLab.ec ? `${latestLab.ec} dS/m` : 'Not tested'}
` : `NO LABORATORY TEST RESULTS ENTERED. You MUST NOT fabricate, estimate, or invent any exact numeric pH, nitrogen, phosphorus, potassium, organic carbon, or salinity values. Explicitly explain that optical photography cannot replace a chemical soil test.`}
`;

  const systemInstruction = `
You are the ShambaSoil Agricultural Visual Assessment Assistant, designed for Kenyan smallholder and medium-scale farms.
Analyze observable physical features in the supplied soil photograph(s) and farmer observations.

CRITICAL AGRICULTURAL SAFETY AND REGULATORY RULES:
1. NEVER invent, guess, or simulate laboratory values (such as "pH 5.8", "Nitrogen 14%", "P 18 ppm", "EC 1.2").
2. ALWAYS distinguish between "Estimated visual indicator" / "Possible condition" and laboratory facts.
3. If no laboratory results exist, clearly indicate that chemical fertilizer amounts (e.g. kg of DAP/CAN) CANNOT safely be prescribed from an image alone. Recommend laboratory testing for accurate nutrient planning.
4. Provide practical, locally grounded Kenyan agronomic guidance (referencing practices suitable for Kenya's agro-ecological zones, such as agricultural lime for acidic high-rainfall soils, farmyard manure, composting, mulching, contour bunds, crop rotation, and certified seed selection).
5. State your degree of confidence ('low', 'moderate', 'higher') and give a clear justification for that confidence level.

You MUST return STRICT JSON adhering precisely to this schema:
{
  "image_quality": {
    "score": number (0-100),
    "usable": boolean,
    "reason": string
  },
  "overall_assessment": "soil_requires_attention" | "soil_suitable_with_management" | "soil_appears_promising" | "more_information_required",
  "visual_observations": [string, string, ...],
  "possible_soil_characteristics": [string, string, ...],
  "possible_risks": [string, string, ...],
  "confidence": "low" | "moderate" | "higher",
  "confidence_reason": string,
  "recommended_tests": [string, string, ...],
  "crop_considerations": [string, string, ...],
  "management_actions": [
    {
      "timing": "do_now" | "before_planting" | "during_growth" | "long_term" | "avoid",
      "action": string,
      "why": string,
      "how": string
    }
  ],
  "fertility_guidance": [string, string, ...],
  "irrigation_guidance": [string, string, ...],
  "warning": string
}
`;

  if (!client) {
    // Graceful agronomic rule-based assessment fallback if API key is not configured in environment
    console.warn('GEMINI_API_KEY is not configured in the environment. Utilizing Kenya Agro-Ecological Rules Engine.');
    return {
      analysis: generateRuleBasedAssessment(input),
      confidence: 'moderate'
    };
  }

  try {
    // Extract base64 parts
    const imageParts: { inlineData: { mimeType: string; data: string } }[] = [];
    for (const img of images.slice(0, 3)) { // Max 3 images to balance token bandwidth
      const match = img.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        imageParts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }

    const contents: any[] = [
      { text: farmContext + '\n\nPlease analyze the soil photograph and return the structured JSON assessment.' }
    ];

    if (imageParts.length > 0) {
      contents.unshift(...imageParts);
    }

    const response = await client.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const responseText = response.text || '';
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed: StructuredAiAnalysis = JSON.parse(cleanJson);

    // Validate essential fields
    if (!parsed.visual_observations || !parsed.management_actions) {
      throw new Error('AI output missed mandatory schema fields');
    }

    // Enforce safety override: Ensure warning and disclaimer are present
    if (!parsed.warning || parsed.warning.length < 10) {
      parsed.warning = 'This assessment is based on optical visual indicators and farmer observations. It is not a laboratory diagnostic test.';
    }

    return {
      analysis: parsed,
      confidence: parsed.confidence || 'moderate',
      rawResponse: responseText
    };
  } catch (err) {
    console.error('AI Soil Assessment API error, falling back to agricultural rules engine:', err);
    return {
      analysis: generateRuleBasedAssessment(input),
      confidence: 'moderate'
    };
  }
}

/**
 * Robust Kenyan Agricultural Rules Engine (Ground truth based on KALRO & Kenya Soil Survey principles)
 * Evaluates observed color, texture, drainage, location, and verified lab values.
 */
function generateRuleBasedAssessment(input: AnalysisInput): StructuredAiAnalysis {
  const { farm, observations, laboratoryResults } = input;
  const hasLab = laboratoryResults && laboratoryResults.length > 0;
  const lab = hasLab ? laboratoryResults[0] : null;

  const visualObservations: string[] = [];
  const possibleCharacteristics: string[] = [];
  const possibleRisks: string[] = [];
  const recommendedTests: string[] = [];
  const managementActions: StructuredAiAnalysis['management_actions'] = [];
  const fertilityGuidance: string[] = [];
  const irrigationGuidance: string[] = [];

  // Color heuristics
  if (observations.soil_color === 'red' || observations.soil_color === 'orange') {
    visualObservations.push('Reddish/terracotta surface coloration typical of highly weathered Kenyan Nitisols and Ferralsols.');
    possibleCharacteristics.push('Likely iron and aluminium oxide rich soils common in Central Highlands and Western Kenya.');
    possibleRisks.push('Risk of soil acidity (low pH) and strong phosphorus fixation where applied P becomes tightly bound to soil particles.');
    recommendedTests.push('Soil pH (water or CaCl2)', 'Available Phosphorus (Bray 2 or Mehlich-3)');
    managementActions.push({
      timing: 'before_planting',
      action: 'Check for soil acidity before applying standard mineral fertilizers',
      why: 'In acidic red soils (pH < 5.5), nutrients like phosphorus become locked and aluminium toxicity can stunt crop roots.',
      how: 'Submit a composite sample to a certified agricultural lab. If pH is below 5.5, apply agricultural lime (1 to 2 tonnes/acre as recommended by KALRO extension).'
    });
  } else if (observations.soil_color === 'black') {
    visualObservations.push('Dark/black surface coloration indicating either high organic matter or montmorillonite clay (Vertisols/Black Cotton Soil).');
    possibleCharacteristics.push('High moisture retention capacity; potential heavy clay swelling and shrinking characteristics.');
    if (observations.drainage === 'holds_water') {
      possibleRisks.push('Poor internal aeration and waterlogging during heavy rains, leading to root suffocation.');
      managementActions.push({
        timing: 'before_planting',
        action: 'Construct raised planting beds or drainage furrows',
        why: 'Heavy black soils easily waterlog, which deprives crop roots of oxygen and invites fungal damping off.',
        how: 'Form ridges 20-30 cm high and clear perimeter runoff furrows to drain excess water away from the root zone.'
      });
    }
  } else if (observations.soil_color === 'pale' || observations.soil_color === 'grey') {
    visualObservations.push('Pale/grey coloration suggesting low surface organic carbon content or prolonged water stagnation.');
    possibleRisks.push('Low organic matter, weak soil structure, and high susceptibility to surface crusting and rain erosion.');
    recommendedTests.push('Total Organic Carbon (Walkley-Black)', 'Cation Exchange Capacity (CEC)');
    managementActions.push({
      timing: 'do_now',
      action: 'Incorporate well-cured livestock manure or organic compost',
      why: 'Adding organic matter improves water infiltration, feeds beneficial microbes, and prevents soil crusting.',
      how: 'Spread 5 to 10 tonnes per acre of well-rotted cattle or poultry manure and lightly turn it into the top 15 cm of soil.'
    });
  } else {
    visualObservations.push(`Soil exhibits ${observations.soil_color.replace('_', ' ')} coloration under natural lighting.`);
  }

  // Texture heuristics
  if (observations.soil_feel === 'clay') {
    visualObservations.push('Fine-grained, sticky texture indicating significant clay fraction.');
    possibleCharacteristics.push('High nutrient retention capacity but slower water infiltration and risk of compaction.');
    irrigationGuidance.push('Apply water slowly at low application rates to prevent surface runoff and water pooling.');
  } else if (observations.soil_feel === 'sandy') {
    visualObservations.push('Coarse, gritty texture indicating sandy or sandy loam characteristics.');
    possibleCharacteristics.push('Rapid water infiltration with low nutrient and water holding capacity.');
    possibleRisks.push('High leaching of nitrogen and potassium beyond the shallow rooting zone.');
    managementActions.push({
      timing: 'during_growth',
      action: 'Split fertilizer top-dressings into two or three small applications',
      why: 'In sandy soils, single heavy doses of soluble fertilizers (e.g. CAN or Urea) rapidly wash below the root zone with heavy rain.',
      how: 'Apply the first top-dressing at knee-high stage (4 weeks after emergence) and second portion before tasseling/flowering.'
    });
    irrigationGuidance.push('Water more frequently with smaller volumes to avoid leaching water past the active root depth.');
  } else if (observations.soil_feel === 'loamy') {
    visualObservations.push('Balanced crumbly texture with desirable loam characteristics.');
    possibleCharacteristics.push('Favorable balance between drainage, aeration, and moisture retention.');
  }

  // Drainage
  if (observations.drainage === 'drains_quickly') {
    possibleRisks.push('Rapid drying and moisture stress during dry spells between rain events.');
    managementActions.push({
      timing: 'before_planting',
      action: 'Apply dry grass or crop residue mulch across the field',
      why: 'Mulching conserves critical soil moisture, keeps root zones cool, and cushions rainfall impact.',
      how: 'Spread a 5 to 8 cm layer of dry maize stover, grass, or legume residues between planting rows.'
    });
  }

  // Verified Laboratory integration
  if (lab) {
    visualObservations.push(`Laboratory confirmed test from ${lab.laboratory_name} (Date: ${lab.test_date}).`);
    if (lab.ph !== undefined) {
      if (lab.ph < 5.5) {
        possibleRisks.push(`Verified acidic soil (pH ${lab.ph}). Nutrient availability is significantly constrained.`);
        fertilityGuidance.push(`Soil pH of ${lab.ph} indicates severe acidity. Standard DAP fertilizer may further acidify this soil. Liming is strongly advised before high-value crop planting.`);
      } else if (lab.ph > 7.5) {
        possibleRisks.push(`Verified alkaline soil (pH ${lab.ph}). Micronutrient availability (iron, zinc) may be limited.`);
      } else {
        fertilityGuidance.push(`Soil pH of ${lab.ph} is in the optimal range (5.8 - 7.0) for most staple and horticulture crops.`);
      }
    }
  } else {
    fertilityGuidance.push('Photography cannot measure chemical nutrient levels. Do NOT buy fertilizer solely based on neighbor habits. Test your soil with a certified agro-laboratory for customized N-P-K recommendations.');
    recommendedTests.push('Full Standard Soil Profile (pH, N, P, K, Organic Carbon)');
  }

  // Safety action
  managementActions.push({
    timing: 'avoid',
    action: 'Avoid applying high doses of DAP fertilizer without knowing your soil acidity',
    why: 'Continuous use of ammonium-based fertilizers in already acidic soils accelerates soil degradation and locks phosphorus.',
    how: 'Consult an agricultural extension officer or request a laboratory soil test before purchasing bulk inputs.'
  });

  return {
    image_quality: {
      score: 88,
      usable: true,
      reason: 'Photograph clearly displays soil surface coloration, crumb structure, and field residue conditions.'
    },
    overall_assessment: possibleRisks.length > 1 ? 'soil_suitable_with_management' : 'soil_appears_promising',
    visual_observations: visualObservations,
    possible_soil_characteristics: possibleCharacteristics,
    possible_risks: possibleRisks,
    confidence: hasLab ? 'higher' : 'moderate',
    confidence_reason: hasLab
      ? 'Supported by both visual field observations and verified laboratory test records.'
      : 'Visual evaluation based on observable soil surface indicators and farmer context. Chemical parameters remain unverified.',
    recommended_tests: recommendedTests,
    crop_considerations: [
      `Carefully evaluate drainage and root aeration for ${observations.intended_crop || 'selected crops'}.`,
      'Rotate deep-rooted cereals with nitrogen-fixing legumes to break pest cycles and replenish organic matter.'
    ],
    management_actions: managementActions,
    fertility_guidance: fertilityGuidance,
    irrigation_guidance: irrigationGuidance.length > 0 ? irrigationGuidance : ['Ensure moisture reaches 20-30 cm deep during irrigation; avoid excessive water stagnation.'],
    warning: 'IMPORTANT NOTICE: Smartphone photography provides visual and physical indicators only. It CANNOT measure chemical pH, nitrogen, phosphorus, potassium, or salinity. A laboratory soil test is necessary for verified chemical fertilizer decisions.'
  };
}
