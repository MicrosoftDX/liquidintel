using System.Collections.Generic;
using SmartKegerator.Models;
using SmartKegerator.Views;
using Xamarin.Forms;

namespace SmartKegerator
{
    public partial class App : Application
    {
        public static string BackendUrl = "http://dxliquidintel.azurewebsites.net/api";

        public static IDictionary<string, string> LoginParameters => null;
        public static UserInfo User;

        public App()
        {
            InitializeComponent();
            SetMainPage();
        }

        public static void SetMainPage()
        {
            GoToMainPage();
        }

        public static void GoToMainPage()
        {
            Current.MainPage = new TabbedPage
            {
                Children = {
                    new NavigationPage(new AvailableBeersPage())
                    {
                        Title = "Beers",
                        Icon = Device.OnPlatform("tab_feed.png", null, null)
                    },
                    new NavigationPage(new ActivitiesPage())
                    {
                        Title = "Activity",
                        Icon = Device.OnPlatform("tab_feed.png", null, null)
                    },
                    new NavigationPage(new VotesPage())
                    {
                        Title = "Votes",
                        Icon = Device.OnPlatform("tab_about.png", null, null)
                    },
                }
            };
        }
    }
}
