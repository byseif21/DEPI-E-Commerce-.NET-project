using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Collections.Generic;
using System.Linq;

namespace Styleza.Extensions
{
    /// <summary>
    /// Extension methods for Controller to standardize error handling
    /// </summary>
    public static class ControllerExtensions
    {
        /// <summary>
        /// Adds a standardized error message to ViewBag for display in the view
        /// </summary>
        /// <param name="controller">The controller instance</param>
        /// <param name="errorMessage">The main error message</param>
        /// <param name="modelState">Optional ModelState containing validation errors</param>
        public static void AddErrorMessage(this Controller controller, string errorMessage, ModelStateDictionary modelState = null)
        {
            controller.ViewBag.ErrorMessage = errorMessage;
            
            if (modelState != null && !modelState.IsValid)
            {
                var errors = new List<string>();
                foreach (var state in modelState)
                {
                    foreach (var error in state.Value.Errors)
                    {
                        errors.Add(error.ErrorMessage);
                    }
                }
                
                controller.ViewBag.ValidationErrors = errors;
            }
        }
        
        /// <summary>
        /// Creates a standardized JSON error response for AJAX requests
        /// </summary>
        /// <param name="controller">The controller instance</param>
        /// <param name="errorMessage">The main error message</param>
        /// <param name="modelState">Optional ModelState containing validation errors</param>
        /// <param name="statusCode">HTTP status code (default: 400 Bad Request)</param>
        /// <returns>JsonResult with standardized error format</returns>
        public static JsonResult JsonError(this Controller controller, string errorMessage, ModelStateDictionary modelState = null, int statusCode = 400)
        {
            var response = new
            {
                success = false,
                message = errorMessage,
                errors = modelState != null && !modelState.IsValid
                    ? modelState.ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray())
                    : null
            };
            
            return new JsonResult(response) { StatusCode = statusCode };
        }
        
        /// <summary>
        /// Creates a standardized JSON success response for AJAX requests
        /// </summary>
        /// <param name="controller">The controller instance</param>
        /// <param name="data">The data to return</param>
        /// <param name="message">Optional success message</param>
        /// <returns>JsonResult with standardized success format</returns>
        public static JsonResult JsonSuccess(this Controller controller, object data = null, string message = "Operation completed successfully")
        {
            var response = new
            {
                success = true,
                message = message,
                data = data
            };
            
            return new JsonResult(response);
        }
    }
}