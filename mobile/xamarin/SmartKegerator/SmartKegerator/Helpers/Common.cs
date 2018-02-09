using System;
using SmartKegerator.Services;

namespace SmartKegerator.Helpers
{
    public static class Common
    {
        private static WebApiClient _webClient;

        public static WebApiClient WebClient
        {
            get {
                if(_webClient == null){
                    _webClient = new WebApiClient();
                }

                return _webClient;
            }
        }
    }
}
