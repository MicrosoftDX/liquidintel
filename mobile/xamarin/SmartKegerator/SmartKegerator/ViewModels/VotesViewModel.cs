using System;
using SmartKegerator.Helpers;
using SmartKegerator.Models;

namespace SmartKegerator.ViewModels
{
    public class VotesViewModel : BaseViewModel
    {
		ObservableRangeCollection<VoteTally> VoteTallys { get; set; }
		ObservableRangeCollection<Vote> Votes { get; set;  }

        public VotesViewModel()
        {
            VoteTallys = new ObservableRangeCollection<VoteTally>();
            Votes = new ObservableRangeCollection<Vote>();

            LoadVoteTallysCommand();
            //LoadVotesCommand();
        }

		public async void LoadVoteTallysCommand()
		{
            await Authentication.Authenticate();
			var votestallyUrl = new Uri(App.BackendUrl + "/votes_tally");
            var votestally = await Common.WebClient.GetAsync<VoteTally[]>(votestallyUrl);
			VoteTallys.AddRange(votestally);
		}

		public async void LoadVotesCommand()
		{
			await Authentication.Authenticate();
			var votestallyUrl = new Uri(App.BackendUrl + "/votes");
			var votestally = await Common.WebClient.GetAsync<VoteTally[]>(votestallyUrl);
			VoteTallys.AddRange(votestally);
		}
    }
}