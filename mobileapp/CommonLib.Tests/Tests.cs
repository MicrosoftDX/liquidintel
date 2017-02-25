using System.Linq;
using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Elixir.Common;
using Newtonsoft.Json;
using System.Diagnostics;

namespace CommonLib.Tests
{
    [TestClass]
    public class Tests
    {
        public TestContext TestContext { get; set; }

        [TestMethod]
        public void CanGetCurrentKeg()
        {
            using (var c = new LiquidIntelClient())
            {
                var keg = c.GetCurrentKegAsync().GetAwaiter().GetResult();

                Debug.Write(JsonConvert.SerializeObject(keg, Formatting.Indented));
            }
        }

        [TestMethod]
        public void CanGetKegsList()
        {
            using (var c = new LiquidIntelClient())
            {
                var kegs = c.GetKegsAsync().GetAwaiter().GetResult();
                Debug.Write(JsonConvert.SerializeObject(kegs, Formatting.Indented));
            }
        }

        [TestMethod]
        public void CanGetTapDetail()
        {
            using (var c = new LiquidIntelClient())
            {
                var currentKeg = c.GetCurrentKegAsync().GetAwaiter().GetResult();
                var tapDetail = c.GetTapDetailsAsync(currentKeg.First().TapId).GetAwaiter().GetResult();

                Debug.Write(JsonConvert.SerializeObject(tapDetail, Formatting.Indented));
            }
        }

        [TestMethod]
        public void CanGetActivities()
        {
            using (var c = new LiquidIntelClient())
            {
                var activities = c.GetActivities().GetAwaiter().GetResult();

                Debug.Write(JsonConvert.SerializeObject(activities, Formatting.Indented));
            }
        }

        [TestMethod]
        public void CanGetActivity()
        {
            using (var c = new LiquidIntelClient())
            {
                var activites = c.GetActivities().GetAwaiter().GetResult();

                var targetActivitySessionId = activites.ElementAt(new Random().Next(activites.Count())).SessionId;

                var activity = c.GetActivityAsync(targetActivitySessionId).GetAwaiter().GetResult();

                Debug.Write(JsonConvert.SerializeObject(activites, Formatting.Indented));
            }
        }
    }
}
