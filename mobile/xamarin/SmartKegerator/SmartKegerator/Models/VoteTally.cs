using System;
namespace SmartKegerator.Models
{
    public class VoteTally
    {
        public int UntappdId { get; set; }
		public string BeerName { get; set; }
		public string Brewery { get; set; }
		public string VoteCount { get; set; }
    }
}
