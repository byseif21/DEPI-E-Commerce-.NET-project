using Microsoft.AspNetCore.Identity.UI.Services;
using System.Threading.Tasks;

namespace Styleza.Services
{
    public class EmailSender : IEmailSender
    {
        // In a production environment, you would configure this with actual email service credentials
        // For development, this is a mock implementation
        public Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            // Log the email details for development purposes
            System.Diagnostics.Debug.WriteLine($"Email: {email}, Subject: {subject}, Message: {htmlMessage}");
            
            // Return a completed task since we're not actually sending emails in development
            return Task.CompletedTask;
        }
    }
}