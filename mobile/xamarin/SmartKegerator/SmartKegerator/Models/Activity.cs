using System;

namespace SmartKegerator.Models
{
    public class Activity
    {
        public string SessionId { get; set; }
        public DateTime PourTime { get; set; }
        public double PourAmount { get; set; }
        public string BeerName { get; set; }
        public string Brewery { get; set; }
        public string BeerType { get; set; }
        public double ABV { get; set; }
        public double IBU { get; set; }
        public string BeerDescription { get; set; }
        public string UntappdId { get; set; }
        public string BeerImagePath { get; set; }
        public int PersonnelNumber { get; set; }
        public string Alias { get; set; }
        public string FullName { get; set; }
        public string UntappdCheckinId { get; set; }
        public string UntappdBadgeName { get; set; }
        public string UntappdBadgeImageURL { get; set; }

        public string HowMuchFullText
        {
            get { return string.Format("poured {0} ml of {1}", PourAmount, BeerName); }
        }

		public string TimeFullText
		{
            get { return string.Format("on {0}", PourTime); }
		}
    }
}