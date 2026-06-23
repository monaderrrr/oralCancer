export function mapPatternToRiskLevel(pattern?: string): 'low' | 'medium' | 'high' {
  if (!pattern || typeof pattern !== 'string') return 'low';

  const normalized = pattern.toLowerCase().trim();

  // Map common AI outputs to risk levels
  const highRiskPatterns = ['high-risk', 'cancer', 'malignant'];
  const mediumRiskPatterns = ['medium-risk', 'precancerous', 'irregularities'];
  const lowRiskPatterns = ['ulcer', 'patches', 'swelling', 'normal', 'healthy'];

  if (highRiskPatterns.includes(normalized)) return 'high';
  if (mediumRiskPatterns.includes(normalized)) return 'medium';
  if (lowRiskPatterns.includes(normalized)) return 'low';

  return 'low';
}
