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
        1. Category: [Hardware, Network, Software].
        2. Priority: 1 (Urgent), 2 (High Priority), 3 (Issue).
        Return EXACTLY: Category|PriorityValue";

    try
    {
        var response = await _client.Models.GenerateContentAsync("gemini-2.5-flash", prompt);
        string[] parts = response.Text.Trim().Split('|');

        if (parts.Length == 2)
        {
            string category = parts[0].Trim();
            int weight = int.Parse(parts[1].Trim());
            string label = weight switch { 1 => "Urgent", 2 => "High Priority", _ => "Issue" };
            return (category, weight, label);
        }
    }
    catch 
    { 
        // We return null so the Controller knows the AI is busy/down
        return null; 
    }

    return null;
    }   
    }
}