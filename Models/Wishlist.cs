using System;

namespace Styleza.Models
{
    public class Wishlist
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int ProductId { get; set; }
        public DateTime AddedDate { get; set; }
        
        // Navigation property
        public Product Product { get; set; }
    }
}