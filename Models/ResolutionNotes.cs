namespace TicketFlowAPI.Models
{
    public class ResolutionNotes
    {
        public int NoteID { get; set; }
        public int TicketID { get; set; }
        public int AdminID { get; set; }
        public string NoteText { get; set; } = string.Empty;
        public DateTime TimeStamp { get; set; } = DateTime.UtcNow;
    }
}