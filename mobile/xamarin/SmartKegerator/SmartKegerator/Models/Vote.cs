using System;
namespace SmartKegerator.Models
{
    public class Vote
    {
        public int VoteId { get; set; }
		public int PersonnelNumber { get; set; }
		public DateTime VoteDate { get; set; }
		public int UntappdId { get; set; }
		public string BeerName { get; set; }
		public string Brewery { get; set; }
		public int untappdId { get; set; }
		public string name { get; set; }
		public string beer_type { get; set; }
		public double ibu { get; set; }
		public double abv { get; set; }
		public string description { get; set; }
		public string brewery { get; set; }
		public string image { get; set; }
    }
}
