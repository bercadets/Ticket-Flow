namespace TicketFlowAPI.Models
{
    public class TicketResponse
    {
        public int TicketID { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }  
        public string Category { get; set; }
        public string PriorityLevel { get; set; }
        public string Status { get; set; }
    }
}