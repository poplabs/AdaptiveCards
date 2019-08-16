using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AdaptiveCards.Rendering.Xamarin.Android.ObjectModel;
using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;

namespace AdaptiveCards.Rendering.Xamarin.Android.Sample.Custom
{
    class CustomAction : BaseActionElement
    {
        public CustomAction(ActionType type) : base(type)
        {
        }

        public String SomeData { get; set; }

    }
}
