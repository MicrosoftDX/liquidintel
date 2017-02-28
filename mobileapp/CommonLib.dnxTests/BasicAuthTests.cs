using System;
using System.Diagnostics;
using System.Linq;
using Elixir.Common;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;

namespace CommonLib.dnxTests
{
    [TestClass]
    public class BasicAuthTests
    {
        [TestMethod]
        public void Basic_CanGetCurrentKeg()
        {
            using (var c = new LiquidIntelClient())
            {
                var keg = c.GetCurrentKegAsync().GetAwaiter().GetResult();

                Debug.Write(JsonConvert.SerializeObject(keg, Formatting.Indented));
            }
        }

        [TestMethod]
        public void Basic_CanGetKegsList()
        {
            using (var c = new LiquidIntelClient())
            {
                var kegs = c.GetKegsAsync().GetAwaiter().GetResult();
                Debug.Write(JsonConvert.SerializeObject(kegs, Formatting.Indented));
            }
        }

        [TestMethod]
        public void Basic_CanGetTapDetail()
        {
            using (var c = new LiquidIntelClient())
            {
                var currentKeg = c.GetCurrentKegAsync().GetAwaiter().GetResult();
                var tapDetail = c.GetTapDetailsAsync(currentKeg.First().TapId).GetAwaiter().GetResult();

                Debug.Write(JsonConvert.SerializeObject(tapDetail, Formatting.Indented));
            }
        }

        [TestMethod]
        public void Basic_CanGetActivities()
        {
            using (var c = new LiquidIntelClient())
            {
                var activities = c.GetActivities().GetAwaiter().GetResult();

                Debug.Write(JsonConvert.SerializeObject(activities, Formatting.Indented));
            }
        }

        [TestMethod]
        public void Basic_CanGetActivity()
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
