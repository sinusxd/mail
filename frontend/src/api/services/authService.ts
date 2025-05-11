import { AxiosResponse } from "axios";
import api from "../api";  // твоя axios-инстанция
import { LoginRequest } from "../models/request/loginRequest";
import { LoginResponse } from "../models/response/loginResponse";
import { SignupRequest } from "../models/request/signupRequest";
import { SignupResponse } from "../models/response/signupResponse";
import {User} from "../models/dto/user";

export default class AuthService {
    static async signup(request: SignupRequest): Promise<AxiosResponse<SignupResponse>> {
        return api.post<SignupResponse>('/api/v1/auth/signup', request);
    }

    static async login(request: LoginRequest): Promise<AxiosResponse<LoginResponse>> {
        const formData = new URLSearchParams();
        formData.append('username', request.username);
        formData.append('password', request.password);
        return api.post<LoginResponse>('/api/v1/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    }

    static async getMe(): Promise<AxiosResponse<User>> {
        return api.get<User>('api/v1/auth/me')
    }
}
