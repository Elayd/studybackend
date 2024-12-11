import supertest from 'supertest';
import { getCoords } from '../../utils/getCoords';
import { getRouteDistance } from '../../utils/getRouteDistance';
import { app, redisClient } from '../..';

jest.mock('axios');
jest.mock('../../utils/getCoords');
jest.mock('../../utils/getRouteDistance');

describe('DeliveryCostCalculator - calculateCost INTEGRATIONS', () => {
  it('should calculate delivery cost correctly non strict', async () => {
    const mockCoordsResponse = { lat: 51.5074, lon: -0.1278 };
    const mockDistanceResponse = 993187.7;

    (getCoords as jest.Mock).mockResolvedValueOnce(mockCoordsResponse);
    (getRouteDistance as jest.Mock).mockResolvedValueOnce(mockDistanceResponse);

    const query = {
      width: '45',
      height: '26',
      weight: '15',
      from: 'London',
      to: 'Manchester',
      isStrict: 'false',
      depth: '21'
    };

    const response = await supertest(app).get('/api/delivery/cost').query(query);

    expect(response.status).toBe(200);
    expect(response.body.cost).toEqual('1538.22');
  });

  it('should calculate delivery cost correctly strict', async () => {
    const mockCoordsResponse = { lat: 51.5074, lon: -0.1278 };
    const mockDistanceResponse = 993187.7;

    (getCoords as jest.Mock).mockResolvedValueOnce(mockCoordsResponse);
    (getRouteDistance as jest.Mock).mockResolvedValueOnce(mockDistanceResponse);

    const query = {
      width: '33',
      height: '25',
      weight: '5',
      from: 'London',
      to: 'Manchester',
      isStrict: 'true',
      depth: '25'
    };

    const response = await supertest(app).get('/api/delivery/cost').query(query);

    expect(response.status).toBe(200);
    expect(response.body.cost).toEqual('1444.95');
  });

  it('should be overweight error in non strict', async () => {
    const mockCoordsResponse = { lat: 51.5074, lon: -0.1278 };
    const mockDistanceResponse = 993187.7;

    (getCoords as jest.Mock).mockResolvedValueOnce(mockCoordsResponse);
    (getRouteDistance as jest.Mock).mockResolvedValueOnce(mockDistanceResponse);

    const query = {
      width: '33',
      height: '25',
      weight: '101',
      from: 'London',
      to: 'Manchester',
      isStrict: 'false',
      depth: '25'
    };

    const response = await supertest(app).get('/api/delivery/cost').query(query);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('OVERWEIGHT_ERROR');
  });

  it('should be overweight error in strict', async () => {
    const mockCoordsResponse = { lat: 51.5074, lon: -0.1278 };
    const mockDistanceResponse = 993187.7;

    (getCoords as jest.Mock).mockResolvedValueOnce(mockCoordsResponse);
    (getRouteDistance as jest.Mock).mockResolvedValueOnce(mockDistanceResponse);

    const query = {
      width: '33',
      height: '25',
      weight: '101',
      from: 'London',
      to: 'Manchester',
      isStrict: 'true',
      depth: '25'
    };

    const response = await supertest(app).get('/api/delivery/cost').query(query);

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('NO_TEMPLATE_SIZE_ERROR');
  });

  it('should calculate delivery cost correctly strict', async () => {
    const mockCoordsResponse = { lat: 51.5074, lon: -0.1278 };
    const mockDistanceResponse = 993187.7;

    (getCoords as jest.Mock).mockResolvedValueOnce(mockCoordsResponse);
    (getRouteDistance as jest.Mock).mockResolvedValueOnce(mockDistanceResponse);

    const query = {
      width: '33',
      height: '25',
      weight: '5',
      from: 'London',
      to: 'Manchester',
      isStrict: 'true'
    };

    const response = await supertest(app).get('/api/delivery/cost').query(query);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ errors: { depth: 'Field is required' } });
  });

  afterAll(async () => {
    redisClient.disconnect();
  });
});
