/**
 * ICP-Native LLM Canister Interface
 * Canister ID: w36hm-eqaaa-aaal-qr76a-cai
 * 
 * This interface defines the Candid IDL for the ICP-native LLM canister.
 * All AI processing happens on-chain through this canister with privacy-preserving data.
 * 
 * IMPORTANT: This is a placeholder interface. In production, this should be generated
 * from the actual LLM canister's Candid file using dfx generate or didc.
 * 
 * Model Throughput Limits:
 * - Average latency: ~1-3 seconds per query
 * - Recommended max concurrent calls: 10
 * - Token limit per request: Varies by model (typically 2048-4096 tokens)
 * - Rate limiting: Implemented at canister level
 * 
 * Future Upgrades:
 * - This interface is designed to be easily upgradeable as the DeAI ecosystem evolves
 * - New methods can be added without breaking existing functionality
 * - Model parameters can be adjusted via getModelInfo and future configuration methods
 */

export const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    // Main LLM prompt method - sends query and receives response
    // Input: Text prompt (string)
    // Output: Generated text response (string)
    // Note: This is a query call for fast response times
    'prompt': IDL.Func([IDL.Text], [IDL.Text], ['query']),
    
    // Get model information and configuration
    // Returns current model details, version, and parameters
    // Useful for monitoring and debugging
    'getModelInfo': IDL.Func([], [IDL.Record({
      'model': IDL.Text,           // Model name/identifier
      'version': IDL.Text,         // Model version
      'maxTokens': IDL.Nat,        // Maximum tokens per request
      'temperature': IDL.Float64,  // Temperature setting for response generation
    })], ['query']),
    
    // Future methods that may be added:
    // 'promptWithConfig': IDL.Func([IDL.Text, IDL.Record({ temperature: IDL.Float64, maxTokens: IDL.Nat })], [IDL.Text], ['query']),
    // 'getUsageStats': IDL.Func([], [IDL.Record({ totalCalls: IDL.Nat, avgLatency: IDL.Nat })], ['query']),
    // 'streamPrompt': IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], ['query']),
  });
};

export const init = ({ IDL }: any) => { return []; };

/**
 * Usage Notes:
 * 
 * 1. Privacy-Preserving Queries:
 *    - Always send normalized/hashed data, never raw health values
 *    - Use the hashHealthData and normalizeHealthDataForLLM functions from useQueries.ts
 * 
 * 2. Error Handling:
 *    - Implement fallback responses for when the LLM canister is unavailable
 *    - Log all errors for monitoring and debugging
 *    - Provide clear user feedback about on-chain processing status
 * 
 * 3. Performance Monitoring:
 *    - Track latency for all LLM calls
 *    - Monitor success/failure rates
 *    - Log cycles usage if available
 *    - Document throughput limits and adjust concurrent call limits accordingly
 * 
 * 4. HIPAA Compliance:
 *    - Ensure all data sent to LLM is properly anonymized
 *    - Never include PII or raw health values in prompts
 *    - Maintain audit logs of all LLM interactions
 * 
 * 5. Future Upgrades:
 *    - This interface is designed to support future DeAI ecosystem enhancements
 *    - New methods can be added without breaking existing code
 *    - Model parameters can be adjusted as the LLM canister evolves
 */
