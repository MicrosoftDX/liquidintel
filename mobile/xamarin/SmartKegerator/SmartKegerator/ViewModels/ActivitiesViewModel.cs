using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using SmartKegerator.Helpers;
using SmartKegerator.Models;

namespace SmartKegerator.ViewModels
{
    public class ActivitiesViewModel : BaseViewModel
    {
        public ObservableRangeCollection<Activity> Activities
        {
            get;
            set;
        }

        public ActivitiesViewModel()
        {
            Activities = new ObservableRangeCollection<Activity>();
            LoadActivitiesCommand();
        }

        public async void LoadActivitiesCommand()
        {
            var activitiesUrl = new Uri(App.BackendUrl + "/activity");
            var activityArray = await Common.WebClient.GetAsync<Activity[]>(activitiesUrl);
            activityArray = activityArray.Take(10).ToArray();
            Activities.AddRange(activityArray);
        }
    }
}
