#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

# syntax=docker/dockerfile:1.2
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443
ENV ASPNETCORE_HTTP_PORTS=80

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["Mjolksyra.Api/Mjolksyra.Api.csproj", "Mjolksyra.Api/"]
COPY ["Mjolksyra.Domain/Mjolksyra.Domain.csproj", "Mjolksyra.Domain/"]
COPY ["Mjolksyra.Infrastructure/Mjolksyra.Infrastructure.csproj", "Mjolksyra.Infrastructure/"]
COPY ["Mjolksyra.UseCases/Mjolksyra.UseCases.csproj", "Mjolksyra.UseCases/"]
RUN dotnet restore "Mjolksyra.Api/Mjolksyra.Api.csproj"
COPY . .
WORKDIR "/src/Mjolksyra.Api"
RUN dotnet build "Mjolksyra.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Mjolksyra.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Mjolksyra.Api.dll"]
