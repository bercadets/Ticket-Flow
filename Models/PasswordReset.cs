using System.ComponentModel.DataAnnotations;

namespace TicketFlowAPI.Models
{
    public class PasswordReset
    {
        [Required, MaxLength(100)]
        public string FName { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string LName { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Username { get; set; } = string.Empty;
        
        [Required, MaxLength(20)]
        public string NewPassword { get; set; } = string.Empty;
    }
}