// src/services/placesService.js
export async function searchPlaces(query, maps) {
  if (!query || query.length < 2) return [];
  
  const service = new maps.places.AutocompleteService();
  
  return new Promise((resolve, reject) => {
    service.getPlacePredictions(
      { input: query, language: 'km' },
      (predictions, status) => {
        if (status === 'OK') resolve(predictions || []);
        else if (status === 'ZERO_RESULTS') resolve([]);
        else reject(new Error(`ការស្វែងរកបរាជ័យ: ${status}`));
      }
    );
  });
}

export async function getPlaceDetails(placeId, maps) {
  const service = new maps.places.PlacesService(document.createElement('div'));
  
  return new Promise((resolve, reject) => {
    service.getDetails(
      {
        placeId,
        fields: ['name', 'formatted_address', 'geometry', 'photos', 'types', 
                 'address_components', 'rating', 'user_ratings_total']
      },
      (place, status) => {
        if (status === 'OK') resolve(place);
        else reject(new Error(`ការទទួលព័ត៌មានលម្អិតបរាជ័យ: ${status}`));
      }
    );
  });
}