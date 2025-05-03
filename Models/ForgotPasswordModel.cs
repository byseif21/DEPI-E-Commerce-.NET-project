using System.ComponentModel.DataAnnotations;

namespace Styleza.Models
{
    public class ForgotPasswordModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}