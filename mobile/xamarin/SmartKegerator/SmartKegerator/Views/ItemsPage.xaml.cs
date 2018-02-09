using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartKegerator.ViewModels;
using Xamarin.Forms;

namespace SmartKegerator
{
    public partial class ItemsPage : ContentPage
    {
        ActivitiesViewModel viewModel;

        public ItemsPage()
        {
            InitializeComponent();

            //BindingContext = viewModel = new ItemsViewModel();
        }

        protected override void OnAppearing()
        {
            base.OnAppearing();

           // if (viewModel.Items.Count == 0)
            //    viewModel.LoadItemsCommand.Execute(null);
        }
    }
}
