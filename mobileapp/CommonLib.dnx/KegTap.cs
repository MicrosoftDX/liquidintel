using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elixir.Common
{
    public struct KegTap
    {
        public int TapId { get; set; }
        public int KegId { get; set; }
        public DateTime InstallDate { get; set; }
        public int KegSize { get; set; }
        public int CurrentVolume { get; set; }
        public string Name { get; set; }
        public string Brewery { get; set; }
        public string BeerType { get; set; }
        public int ABV { get; set; }
        public int IBU { get; set; }
        public string BeerDescription { get; set; }
        public int? UntappdId { get; set; }
        public string imagePath { get; set; }
    }
}
