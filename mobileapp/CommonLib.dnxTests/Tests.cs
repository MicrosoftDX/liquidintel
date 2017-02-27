using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using Elixir.Common;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CommonLib.Tests
{
    [TestClass]
    public class Tests
    {
        private static LiquidIntelClient _adminClient, _userClient;

        private const string ADMIN_REFRESH_TOKEN = @"AQABAAAAAADRNYRQ3dhRSrm-4K-adpCJ_P73UDtrkQMcJ8MlkKhXkAoj37b4TeCkaBCHVPB1KlBCiQY6kK5_j0Qb1Ccx98Fg6qzPz_ybFNJCVC4mwEd1xlG2b3-1D5QvrUQJs8KIUl8JWkpVAd2T1jCtrko4jVNQcyD8d4lwVBWnGhjDj79uStB6HRBaSI6vqyfcXZPIsySrftV06EPFk6imvUkpehwTBymVL-V3A-L83-DEYcgVolxdLTqKGBvgR66sNqck6MyKhh8rgYIlK7OcAae1szpHHlczDhc4qgxPyBOhQOUVHpse21rmxsgv8j-0xJeyc3zNpm8D3ZWne8vASgB72BhHRGf2jk6zXuTpdifTEQYI7nK4wHGDID2TD33kzoHDNEQNM1xKRX9GJ44qsb--BDcJFyh5NwbiQJo_B70jw95ER3ZH83sxZ64fnYWaQYcCRaXKXFc981pmLUXabq0X5DoyOkJ07ezqKP0vuinahPeQxgyjzjBEyI4r0pvd_xDvNT8d2iMv-oxvxkzA5oc9g9Q14GbGjWmI6-kYjYP4xfYjejCJ68-7gkT2waGFfoCf2WCijUKRRMb4YvX9gO72z_fzc-NgdJvQXM8sFIJVCIMEKOzxpRM9egB68N9GC3rskvZH13fRfwR62oe6GOgIDTnec0639R_h0suVqejPoRXZBScHbj4504VnGiBcpNqDa8yAB0soVmDK-kxr_e0r999WCF19LuFFN7CVV7ZtHzawGkCXk8YP5wg0D_BUWmZzrNL1n4S3u7EeAL6V59UrvkmLo6kYY9pDgn3_0a4ujBTu9iAA";

        private const string NON_ADMIN_REFRESH_TOKEN = @"AQABAAAAAADRNYRQ3dhRSrm-4K-adpCJZR0GJz444b2NQ-rWF5v70g9x-k2Xut0MXwzamO3iJ-59QgJqw1W1-hO9q8NxZ-JGxdcPjSxWU4ibUE3Rpi-TA-w_n_4D9GUqB-o29mx3EpLrve7WyhWryharM1DMhpJIxS90Ry38DTQwmy83kIA9-x7mdccO3DuLsiOEtaNHBUJCv0PXgq2jWtUqnt6Iw-a5K75dLcQ7w6MeVpmjfewql5-1pjpSgU5tMD60axVhqYyphuxq6LS4QBIzS2IxLasZVZoUb4KTwRmquF1ZYKBcIhjOaQXd47FTT3X2OqKfWe0Cinity6bcU0f2V4BZwBt-RdvcZz5opHE3Vode22gyln-Neit7TfWsOoQECzLIVpISBpW_mBS8DIpkxb8rtmQ5sRi6qny-Xrw6wuJvHjmp7XFdjpKD74FQrlNuovNOSELgFBhwn5KpG8jHmcIttaA2QL2K_uBDKTx2wNcbD4j2JgHpg1mUZXz7qjmAyxodAMtFJ5QGHxk0u1bvAJCjvsNcKO5oNRBTRwaHME3J2_XOp-bJBEOVnW4gJL2pdPQjlmRpKKeL1O2k-sBkNCB0nVIdmV0OEXkUdbod7YoDEmJaAHxcPc68pIUwdZGiQxpwwD-YmuI15R2c6h22r0AiYp5MuzYDch3pmM9Nr9_j2UTsULEDlZdUOE6kUTCjof6yPa_UmVG58txN1NWjyo_Jf_syxiYdIznq7sE3iwdzhsZtQhIaabwtipHfZQTK7qcwfbzQpmmByyD-8mG5wlKDFyG1sEoauOCRqkBd3jCxu7KtniAA";

        [ClassInitialize]
        public static void ClassInit(TestContext context)
        {
            using (var c = new HttpClient())
            {
                var tokenRequestResponse = c.PostAsync(@"https://login.microsoftonline.com/microsoft.com/oauth2/token", new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string,string>( @"grant_type", @"refresh_token" ),
                    new KeyValuePair<string, string>(@"client_id", @"f085e5e6-2f64-4fec-b139-00edf1d6d70c"),
                    new KeyValuePair<string, string>(@"refresh_token", ADMIN_REFRESH_TOKEN),
                    new KeyValuePair<string, string>(@"resource",@"b1e80748-43c2-4450-9121-cbc0dcc98051"),
                    new KeyValuePair<string, string>(@"client_secret", @"a2wDcRGN9YzinzFJWV+WmkclClDndv4g8+I7HdrK2UE=")
                })).GetAwaiter().GetResult();

                var responseVal = tokenRequestResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                var bearerToken = JObject.Parse(responseVal).Value<string>(@"access_token");
                Debug.WriteLine($@"Admin Bearer Token: {bearerToken}");

                _adminClient = new LiquidIntelClient(bearerToken);

                tokenRequestResponse = c.PostAsync(@"https://login.microsoftonline.com/microsoft.com/oauth2/token", new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string,string>( @"grant_type", @"refresh_token" ),
                    new KeyValuePair<string, string>(@"client_id", @"f085e5e6-2f64-4fec-b139-00edf1d6d70c"),
                    new KeyValuePair<string, string>(@"refresh_token", NON_ADMIN_REFRESH_TOKEN),
                    new KeyValuePair<string, string>(@"resource",@"b1e80748-43c2-4450-9121-cbc0dcc98051"),
                    new KeyValuePair<string, string>(@"client_secret", @"a2wDcRGN9YzinzFJWV+WmkclClDndv4g8+I7HdrK2UE=")
                })).GetAwaiter().GetResult();

                responseVal = tokenRequestResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                bearerToken = JObject.Parse(responseVal).Value<string>(@"access_token");
                Debug.WriteLine($@"Non-Admin Bearer Token: {bearerToken}");

                _userClient = new LiquidIntelClient(bearerToken);
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
            var users = _adminClient.GetUsersAsync().GetAwaiter().GetResult();

            Debug.Write(JsonConvert.SerializeObject(users, Formatting.Indented));
        }
    }
}
