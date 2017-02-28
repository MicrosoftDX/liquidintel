using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elixir.Common
{
    public struct Activity
    {
        public int SessionId { get; set; }
        public DateTime PourTime { get; set; }
        public int PourAmount { get; set; }
        public string BeerName { get; set; }
        public string Brewery { get; set; }
        public string BeerType { get; set; }
        public int ABV { get; set; }
        public int IBU { get; set; }
        public string BeerDescription { get; set; }
        public object UntappdId { get; set; }
        public string BeerImagePath { get; set; }
        public int PersonnelNumber { get; set; }
        public string Alias { get; set; }
        public string FullName { get; set; }
    }
}
