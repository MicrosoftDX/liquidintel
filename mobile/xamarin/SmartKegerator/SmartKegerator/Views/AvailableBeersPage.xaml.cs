using System;
using System.Collections.Generic;
using SmartKegerator.Helpers;
using SmartKegerator.Services;
using Xamarin.Forms;

namespace SmartKegerator.Views
{
    public partial class AvailableBeersPage : ContentPage
    {
        public AvailableBeersPage()
        {
            InitializeComponent();
            Authentication.Authenticate();
        }
    }
}
