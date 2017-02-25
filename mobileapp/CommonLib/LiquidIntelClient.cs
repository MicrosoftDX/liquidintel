using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Xamarin.Forms;
using System.Net.Http.Headers;
using System.Collections;

namespace Elixir.Common
{
    public class LiquidIntelClient : IDisposable
    {
        private const string BASIC_AUTH_USER = @"0001-0001";
        private const string BASIC_AUTH_PASSWORD = @"ZHhsaXF1aWQtcmFzcGJlcnJ5cGk=";
        private static readonly string BASE_URL = $@"http://dxliquidintel.azurewebsites.net/api/";

        private readonly Lazy<HttpClient> _basicClient = new Lazy<HttpClient>(() =>
        {
            var c = new HttpClient
            {
                BaseAddress = new Uri(BASE_URL)
            };

            byte[] byteArray = Encoding.UTF8.GetBytes(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSWORD);
            var authHeader = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));

            c.DefaultRequestHeaders.Authorization = authHeader;
            return c;
        });
        private readonly Lazy<HttpClient> _authClient;

        private readonly bool _hasAuth;

        public LiquidIntelClient(string authToken = null)
        {
            if (_hasAuth = !string.IsNullOrWhiteSpace(authToken))
            {
                _authClient = new Lazy<HttpClient>(() =>
                {
                    var c = new HttpClient
                    {
                        BaseAddress = new Uri(BASE_URL)
                    };

                    byte[] byteArray = Encoding.UTF8.GetBytes(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSWORD);
                    var authHeader = new AuthenticationHeaderValue("Bearer", authToken);

                    c.DefaultRequestHeaders.Authorization = authHeader;
                    return c;
                });
            }
        }

        public async Task<IEnumerable<Keg>> GetKegsAsync()
        {
            var kegsResponse = await _basicClient.Value.GetStringAsync(@"kegs");

            return await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<Keg>>(kegsResponse));
        }

        public async Task<IEnumerable<KegTap>> GetCurrentKegAsync()
        {
            var kegResponse = await _basicClient.Value.GetStringAsync(@"currentkeg");

            return await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<KegTap>>(kegResponse));
        }

        public async Task<KegTap> GetTapDetailsAsync(int tapId)
        {
            var currentKeg = await GetCurrentKegAsync();

            var tapIdDetailResponse = await _basicClient.Value.GetStringAsync($@"currentkeg/{tapId}");

            return await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<KegTap>>(tapIdDetailResponse).SingleOrDefault());
        }

        public async Task<IEnumerable<Activity>> GetActivities()
        {
            var activitiesResponse = await _basicClient.Value.GetStringAsync(@"activity");

            return await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<Activity>>(activitiesResponse));
        }

        public async Task<Activity> GetActivityAsync(int sessionId)
        {
            var activityResponse = await _basicClient.Value.GetStringAsync($@"activity/{sessionId}");

            return await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<Activity>>(activityResponse).SingleOrDefault());
        }


        public async Task<IEnumerable<User>> GetUsers()
        {
            if (!_hasAuth)
                throw new InvalidOperationException(@"Client must be authenticated");

            var usersResponse = _authClient.Value.GetStringAsync(@"users");

            return await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<User>>(usersResponse));
        }

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    if (_basicClient.IsValueCreated)
                    {
                        _basicClient.Value.Dispose();
                    }
                }

                // TODO: free unmanaged resources (unmanaged objects) and override a finalizer below.
                // TODO: set large fields to null.

                disposedValue = true;
            }
        }

        // TODO: override a finalizer only if Dispose(bool disposing) above has code to free unmanaged resources.
        // ~LiquidIntelClient() {
        //   // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
        //   Dispose(false);
        // }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
            // TODO: uncomment the following line if the finalizer is overridden above.
            // GC.SuppressFinalize(this);
        }
        #endregion
    }
}
