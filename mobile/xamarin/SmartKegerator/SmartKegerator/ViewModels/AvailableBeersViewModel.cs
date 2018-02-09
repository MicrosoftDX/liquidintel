using System;
using System.Linq;
using SmartKegerator.Helpers;
using SmartKegerator.Models;

namespace SmartKegerator.ViewModels
{
    public class AvailableBeersViewModel : BaseViewModel
    {
        public KegInfo LeftKeg
		{
			get;
			set;
		}

		public KegInfo RightKeg
		{
			get;
			set;
		}

        public AvailableBeersViewModel()
        {
            //Yeah, I know. We will have a better way later ;)
            LeftKeg = new KegInfo() { Name = "Loading..." };
            RightKeg = LeftKeg;
            LoadKegInfoCommand();
        }

        public async void LoadKegInfoCommand()
		{
			var ketInfoUrl = new Uri(App.BackendUrl + "/CurrentKeg");
			var kegInfoArray = await Common.WebClient.GetAsync<KegInfo[]>(ketInfoUrl);

            LeftKeg = kegInfoArray[0];
            RightKeg = kegInfoArray[1];

			OnPropertyChanged(nameof(LeftKeg));
			OnPropertyChanged(nameof(RightKeg));

        }
    }
}
