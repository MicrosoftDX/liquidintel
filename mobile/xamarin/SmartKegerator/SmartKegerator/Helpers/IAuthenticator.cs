using System;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Clients.ActiveDirectory;

namespace SmartKegerator.Helpers
{
	public interface IAuthenticator
	{
		Task<AuthenticationResult> Authenticate(string resource, string userId, string returnUrl);
	}
}
