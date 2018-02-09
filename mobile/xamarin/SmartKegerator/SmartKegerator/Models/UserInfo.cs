using System;
namespace SmartKegerator.Models
{
    public class UserInfo
    {
        public int PersonnelNumber { get; set; }
        public string UserPrincipalName { get; set; }
        public string UntappdUserName { get; set; }
        public string UntappdAccessToken { get; set; }
        public bool CheckinFacebook { get; set; }
        public bool CheckinTwitter { get; set; }
        public bool CheckinFoursquare { get; set; }
        public string FullName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public bool IsAdmin { get; set; }
        public string ThumbnailImageUri { get; set; }
    }
}
