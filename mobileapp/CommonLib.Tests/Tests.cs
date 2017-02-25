using System.Linq;
using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Elixir.Common;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Net.Http;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace CommonLib.Tests
{
    [TestClass]
    public class Tests
    {
        private static LiquidIntelClient _authClient;
        [ClassInitialize]
        public static void ClassInit(TestContext context)
        {
            using (var c = new HttpClient())
            {
                var tokenRequestResponse = c.PostAsync(@"https://login.microsoftonline.com/microsoft.com/oauth2/token", new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string,string>( @"grant_type", @"client_credentials" ),
                    new KeyValuePair<string, string>(@"resource",@"http://dxliquidintel"),
                    new KeyValuePair<string, string>(@"client_id", @"b1e80748-43c2-4450-9121-cbc0dcc98051"),
                    new KeyValuePair<string, string>(@"client_secret", @"pSYb/gt32uAcXDaCJnBkYVqJnxhnxKDshZsrcGJfnVo=")
                })).GetAwaiter().GetResult();

                var responseVal = tokenRequestResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                var bearerToken = JObject.Parse(responseVal).Value<string>(@"access_token");

                _authClient = new LiquidIntelClient(bearerToken);
            }
        }

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

        [TestMethod]
        public void CanGetUsers()
        {
            var users = _authClient.GetUsersAsync().GetAwaiter().GetResult();

            Debug.Write(JsonConvert.SerializeObject(users, Formatting.Indented));
        }
    }
}
