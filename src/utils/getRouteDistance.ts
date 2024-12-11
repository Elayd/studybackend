import axios from 'axios';
import { AppError } from '../helpers/errorHandler';
import { ErrorsDescriptions } from '../enums/errorsDescriptions';
import HttpStatusCode from '../enums/httpStatusCodes';

export async function getRouteDistance(
  fromCoords: { lat: number; lon: number },
  toCoords: { lat: number; lon: number }
) {
  const url = `http://router.project-osrm.org/route/v1/driving/${fromCoords.lon},${fromCoords.lat};${toCoords.lon},${toCoords.lat}?overview=false&geometries=geojson`;
  try {
    const response = await axios.get(url);
    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const distance = response.data.routes[0].legs[0].distance;
      return distance;
    } else {
      throw new Error('Маршрут не найден');
    }
  } catch (error) {
    throw new AppError(ErrorsDescriptions.GET_DISTANCE_ERROR, true, error, HttpStatusCode.BAD_REQUEST);
  }
}
