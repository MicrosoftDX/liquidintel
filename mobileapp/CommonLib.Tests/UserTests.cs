using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using Elixir.Common;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CommonLib.dnxTests
{
    [TestClass]
    public class UserTests
    {
        private static LiquidIntelClient _userClient;
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
                    new KeyValuePair<string, string>(@"refresh_token", NON_ADMIN_REFRESH_TOKEN),
                    new KeyValuePair<string, string>(@"resource",@"b1e80748-43c2-4450-9121-cbc0dcc98051"),
                    new KeyValuePair<string, string>(@"client_secret", @"a2wDcRGN9YzinzFJWV+WmkclClDndv4g8+I7HdrK2UE=")
                })).GetAwaiter().GetResult();

                var responseVal = tokenRequestResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                var bearerToken = JObject.Parse(responseVal).Value<string>(@"access_token");
                Debug.WriteLine($@"Non-Admin Bearer Token: {bearerToken}");

                _userClient = new LiquidIntelClient(bearerToken);
            }
        }

        [TestMethod]
        public void User_CanGetMe()
        {
            var user = _userClient.GetUsersAsync().GetAwaiter().GetResult();

            Debug.Write(JsonConvert.SerializeObject(user, Formatting.Indented));
        }

    }
}
