using System;

namespace Styleza.Models
{
    public class CartItem
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public int CartId { get; set; }
        
        // Navigation property
        public Product Product { get; set; }
        public Cart Cart { get; set; }
    }
}