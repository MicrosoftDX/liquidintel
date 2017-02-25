using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Elixir.Common
{
    public struct Keg
    {
        public int KegId { get; set; }
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
