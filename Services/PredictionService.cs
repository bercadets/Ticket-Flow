using Google.GenAI;
using Microsoft.Extensions.Configuration;


namespace TicketFlowAPI.Services
{
    public class PredictionService
    {
        private readonly Client _client;


        public PredictionService(IConfiguration config)
        {

            string apiKey = config["GeminiSettings:ApiKey"];
            _client = new Client(apiKey: apiKey);
        }


        public async Task<(string Category, int Weight, string Label)?> PredictTicketAsync(string description)
{
    string prompt = $@"
        Analyze this IT ticket: ""{description}""
        First, validate if this is related to IT/technical issues in these categories:
        1. Category: [Hardware, Network, Software]
        2. Priority: 1 (Urgent), 2 (High Priority), 3 (Issue)
        
        If the issue is NOT related to Hardware, Network, or Software (e.g., non-technical issues like physical fights, social problems, etc.), respond with: Unrelated|0
        Otherwise, return EXACTLY: Category|PriorityValue";


    try
    {
        var response = await _client.Models.GenerateContentAsync("gemini-2.5-flash", prompt);
        string[] parts = response.Text.Trim().Split('|');


        if (parts.Length == 2)
        {
            string category = parts[0].Trim();
            
            // Check if the AI determined this is unrelated to IT issues
            if (category.Equals("Unrelated", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("[VALIDATION] Issue is unrelated to IT/technical support. Try again with a relevant IT issue.");
                return null;  // Return null to prevent storage in database
            }
            
            // Validate category is one of the expected values
            if (!category.Equals("Hardware", StringComparison.OrdinalIgnoreCase) &&
                !category.Equals("Network", StringComparison.OrdinalIgnoreCase) &&
                !category.Equals("Software", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("[VALIDATION] Issue is unrelated try again");
                return null;  // Return null to prevent storage in database
            }
            
            int weight = int.Parse(parts[1].Trim());
            string label = weight switch { 1 => "Urgent", 2 => "High Priority", _ => "Issue" };
            return (category, weight, label);
        }
    }
    catch
    {
        // We return null so the Controller knows the AI is busy/down
        Console.WriteLine("[ERROR] AI is busy pls try again");
        return null;
    }


    Console.WriteLine("[VALIDATION] Issue is unrelated try again");
    return null;
    }  
    }
}
