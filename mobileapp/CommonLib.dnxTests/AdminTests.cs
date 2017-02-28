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
    public class AdminTests
    {
        private static LiquidIntelClient _adminClient;
        private const string ADMIN_REFRESH_TOKEN = @"AQABAAAAAADRNYRQ3dhRSrm-4K-adpCJ_P73UDtrkQMcJ8MlkKhXkAoj37b4TeCkaBCHVPB1KlBCiQY6kK5_j0Qb1Ccx98Fg6qzPz_ybFNJCVC4mwEd1xlG2b3-1D5QvrUQJs8KIUl8JWkpVAd2T1jCtrko4jVNQcyD8d4lwVBWnGhjDj79uStB6HRBaSI6vqyfcXZPIsySrftV06EPFk6imvUkpehwTBymVL-V3A-L83-DEYcgVolxdLTqKGBvgR66sNqck6MyKhh8rgYIlK7OcAae1szpHHlczDhc4qgxPyBOhQOUVHpse21rmxsgv8j-0xJeyc3zNpm8D3ZWne8vASgB72BhHRGf2jk6zXuTpdifTEQYI7nK4wHGDID2TD33kzoHDNEQNM1xKRX9GJ44qsb--BDcJFyh5NwbiQJo_B70jw95ER3ZH83sxZ64fnYWaQYcCRaXKXFc981pmLUXabq0X5DoyOkJ07ezqKP0vuinahPeQxgyjzjBEyI4r0pvd_xDvNT8d2iMv-oxvxkzA5oc9g9Q14GbGjWmI6-kYjYP4xfYjejCJ68-7gkT2waGFfoCf2WCijUKRRMb4YvX9gO72z_fzc-NgdJvQXM8sFIJVCIMEKOzxpRM9egB68N9GC3rskvZH13fRfwR62oe6GOgIDTnec0639R_h0suVqejPoRXZBScHbj4504VnGiBcpNqDa8yAB0soVmDK-kxr_e0r999WCF19LuFFN7CVV7ZtHzawGkCXk8YP5wg0D_BUWmZzrNL1n4S3u7EeAL6V59UrvkmLo6kYY9pDgn3_0a4ujBTu9iAA";

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
            }
        }
    }
}
