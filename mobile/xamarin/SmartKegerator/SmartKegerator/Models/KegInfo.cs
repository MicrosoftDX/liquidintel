using System;
namespace SmartKegerator.Models
{
    public class KegInfo
    {
        public string TapId { get; set; }
        public int KegId { get; set; }
        public DateTime InstallDate { get; set; }
        public double KegSize { get; set; }
        public double CurrentVolume { get; set; }
        public string Name { get; set; }
        public string Brewery { get; set; }
        public string BeerType { get; set; }
        public double ABV { get; set; }
        public double IBU { get; set; }
        public string BeerDescription { get; set; }
        public int UntappId { get; set; }
        public string imagePath { get; set; }

        public string Level
        {
            get { return string.Format("Level {0:F1}% full", CurrentVolume / KegSize * 100); }
        }
    }
}
