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

        private readonly Lazy<HttpClient> _webClient = new Lazy<HttpClient>(() => new HttpClient
        {
            BaseAddress = new Uri(BASE_URL)
        });

        private readonly string _authToken;

        public LiquidIntelClient(string authToken = null)
        {
            _authToken = authToken;
        }

        public async Task<IEnumerable<Keg>> GetKegsAsync()
        {
            var kegsResponse = await _webClient.Value.GetStringAsync(@"kegs");

            return await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<Keg>>(kegsResponse));
        }

        public async Task<IEnumerable<KegTap>> GetCurrentKegAsync()
        {
            var kegResponse = await _webClient.Value.GetStringAsync(@"currentkeg");

            return await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<KegTap>>(kegResponse));
        }

        public async Task<KegTap> GetTapDetailsAsync(int tapId)
        {
            var currentKeg = await GetCurrentKegAsync();

            var tapIdDetailResponse = await _webClient.Value.GetStringAsync($@"currentkeg/{tapId}");

            return await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<KegTap>>(tapIdDetailResponse).SingleOrDefault());
        }

        public async Task<IEnumerable<Activity>> GetActivities()
        {
            var activitiesResponse = await _webClient.Value.GetStringAsync(@"activity");

            return await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<Activity>>(activitiesResponse));
        }

        public async Task<Activity> GetActivityAsync(int sessionId)
        {
            var activityResponse = await _webClient.Value.GetStringAsync($@"activity/{sessionId}");

            return await Task.Factory.StartNew(() => JsonConvert.DeserializeObject<List<Activity>>(activityResponse).SingleOrDefault());
        }


        public async Task<List<User>> GetUsers()
        {
            throw new NotImplementedException();
        }

        private void SetBasicAuth()
        {
            if (_webClient.Value.DefaultRequestHeaders?.Authorization?.Scheme?.ToLower() != @"basic")
            {
                byte[] byteArray = Encoding.UTF8.GetBytes(BASIC_AUTH_USER + ":" + BASIC_AUTH_PASSWORD);
                var authHeader = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));

                _webClient.Value.DefaultRequestHeaders.Authorization = authHeader;
            }
        }

        private void SetBearerAuth()
        {
            if (!string.IsNullOrWhiteSpace(_authToken) && _webClient.Value.DefaultRequestHeaders?.Authorization?.Scheme?.ToLower() != @"bearer")
            {
                var authHeader = new AuthenticationHeaderValue("Basic", _authToken);

                _webClient.Value.DefaultRequestHeaders.Authorization = authHeader;
            }
        }

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    if (_webClient.IsValueCreated)
                    {
                        _webClient.Value.Dispose();
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
