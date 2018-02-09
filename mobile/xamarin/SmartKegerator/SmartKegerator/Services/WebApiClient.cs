using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace SmartKegerator.Services
{
	public class WebApiClient : IDisposable
	{
		private readonly HttpClient _httpClient;

		public WebApiClient() :
        this(new HttpClient(new HttpClientHandler() { AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate, Credentials = new NetworkCredential("0001-0001", "ZHhsaXF1aWQtcmFzcGJlcnJ5cGk=") }))
		{
		}

		/// <summary>
		/// Only use this constructor for tests!
		/// </summary>
		/// <param name="httpClient"></param>
		public WebApiClient(HttpClient httpClient)
		{
			_httpClient = httpClient;
			_httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
			_httpClient.DefaultRequestHeaders.AcceptEncoding.Add(new StringWithQualityHeaderValue("gzip"));
			_httpClient.DefaultRequestHeaders.AcceptEncoding.Add(new StringWithQualityHeaderValue("deflate"));
			_httpClient.DefaultRequestHeaders.ExpectContinue = false;
		}

        public void SetBearer(string token){
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

		public async Task<T> GetAsync<T>(Uri uri, IDictionary<string, string> headers = null)
		{
			using (var request = CreateRequest(HttpMethod.Get, uri, headers))
			{
				using (var response = await SendAsync(request))
				{
					return await GetResponseContent<T>(response);
				}
			}
		}

		public async Task<T> PostAsync<T>(Uri uri, string body, IDictionary<string, string> headers = null)
		{
			using (var response = await RequestWithBody(HttpMethod.Post, uri, body, headers))
			{
				return await GetResponseContent<T>(response);
			}
		}

		public async Task<HttpResponseMessage> RequestWithBody<T>(HttpMethod method, Uri uri, T body, IDictionary<string, string> headers = null)
		{
			using (var request = CreateRequest(method, uri, body, headers))
			{
				return await SendAsync(request);
			}
		}

		public void Dispose()
		{
			Dispose(true);
			GC.SuppressFinalize(this);
		}

		protected virtual void Dispose(bool disposing)
		{
			if (_httpClient != null && disposing)
			{
				_httpClient.Dispose();
			}
		}

		private HttpRequestMessage CreateRequest(HttpMethod method, Uri uri, IDictionary<string, string> headers = null)
		{
			var request = new HttpRequestMessage(method, uri);

			if (headers != null)
			{
				foreach (var keyVal in headers)
				{
					request.Headers.Add(keyVal.Key, new[] { keyVal.Value });
				}
			}

			return request;
		}

		private HttpRequestMessage CreateRequest<T>(HttpMethod method, Uri uri, T content, IDictionary<string, string> headers = null)
		{
			var request = CreateRequest(method, uri, headers);

			string stringContent = string.Empty;
			if (typeof(T) != typeof(string))
			{
				stringContent = JsonConvert.SerializeObject(content);
			}
			else
			{
				stringContent = (string)(object)content;
			}

			request.Content = new StringContent(stringContent, Encoding.UTF8, "application/json");
			return request;
		}

		private async Task<T> GetResponseContent<T>(HttpResponseMessage response)
		{
			var content = response?.Content != null ? await response.Content.ReadAsStringAsync() : null;
			return Deserialize<T>(content);
		}

		private static T Deserialize<T>(string content)
		{
			if (typeof(T).Equals(typeof(string)))
			{
				return (T)(object)content;
			}

			T returnValue = default(T);
			try
			{
				returnValue = JsonConvert.DeserializeObject<T>(content);
			}
			catch (Exception e)
			{
                Debug.WriteLine(e.Message);
				throw;
			}

			return returnValue;
		}

		private async Task<HttpResponseMessage> SendAsync(HttpRequestMessage message)
		{
			try
			{
				return await _httpClient.SendAsync(message);
			}
			catch (Exception e) when (e is HttpRequestException || e is WebException)
			{
				Debug.WriteLine(e.Message);
				return new HttpResponseMessage()
				{
					ReasonPhrase = e.Message,
					StatusCode = HttpStatusCode.ServiceUnavailable
				};
			}
		}
	}
}


