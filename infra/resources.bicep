@description('The location used for all deployed resources')
param location string = resourceGroup().location

@description('Tags that will be applied to all resources')
param tags object = {}

@description('Environment name used for environment-specific resource names')
param environmentName string

param mjolksyraApiExists bool
@secure()
param mjolksyraApiDefinition object
param mjolksyraAppExists bool
@secure()
param mjolksyraAppDefinition object

@description('Id of the user or app to assign application roles')
param principalId string

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = uniqueString(subscription().id, resourceGroup().id, location)
var envName = toLower(environmentName)
var isProd = envName == 'prod'
var envShort = isProd ? 'p' : (envName == 'preview' ? 'v' : take(replace(envName, '-', ''), 2))
var apiContainerAppName = '${envName}-mjolksyra-api'
var appContainerAppName = '${envName}-mjolksyra-app'
var apiIdentityName = '${abbrs.managedIdentityUserAssignedIdentities}${envName}-mj-api-${resourceToken}'
var appIdentityName = '${abbrs.managedIdentityUserAssignedIdentities}${envName}-mj-app-${resourceToken}'
var apiKeyVaultName = '${abbrs.keyVaultVaults}${resourceToken}${envShort}a'
var appKeyVaultName = '${abbrs.keyVaultVaults}${resourceToken}${envShort}b'

// Monitor application with Azure Monitor
module monitoring 'br/public:avm/ptn/azd/monitoring:0.1.0' = {
  name: 'monitoring'
  params: {
    logAnalyticsName: '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
    applicationInsightsName: '${abbrs.insightsComponents}${resourceToken}'
    applicationInsightsDashboardName: '${abbrs.portalDashboards}${resourceToken}'
    location: location
    tags: tags
  }
}

// Container registry
module containerRegistry 'br/public:avm/res/container-registry/registry:0.1.1' = {
  name: 'registry'
  params: {
    name: '${abbrs.containerRegistryRegistries}${resourceToken}'
    location: location
    acrAdminUserEnabled: true
    tags: tags
    publicNetworkAccess: 'Enabled'
    roleAssignments: [
      {
        principalId: mjolksyraApiIdentity.outputs.principalId
        principalType: 'ServicePrincipal'
        roleDefinitionIdOrName: subscriptionResourceId(
          'Microsoft.Authorization/roleDefinitions',
          '7f951dda-4ed3-4680-a7ca-43fe172d538d'
        )
      }
      {
        principalId: mjolksyraAppIdentity.outputs.principalId
        principalType: 'ServicePrincipal'
        roleDefinitionIdOrName: subscriptionResourceId(
          'Microsoft.Authorization/roleDefinitions',
          '7f951dda-4ed3-4680-a7ca-43fe172d538d'
        )
      }
    ]
  }
}

// Container apps environment
module containerAppsEnvironment 'br/public:avm/res/app/managed-environment:0.4.5' = {
  name: 'container-apps-environment'
  params: {
    logAnalyticsWorkspaceResourceId: monitoring.outputs.logAnalyticsWorkspaceResourceId
    name: '${abbrs.appManagedEnvironments}${resourceToken}'
    location: location
    zoneRedundant: false
  }
}

module mjolksyraApiIdentity 'br/public:avm/res/managed-identity/user-assigned-identity:0.2.1' = {
  name: 'mjolksyraApiidentity'
  params: {
    name: apiIdentityName
    location: location
  }
}

module mjolksyraApiFetchLatestImage './modules/fetch-container-image.bicep' = {
  name: 'mjolksyraApi-fetch-image'
  params: {
    exists: mjolksyraApiExists
    name: apiContainerAppName
  }
}

var mjolksyraApiAppSettingsArray = filter(array(mjolksyraApiDefinition.settings), i => i.name != '')
var mjolksyraApiSecrets = map(filter(mjolksyraApiAppSettingsArray, i => i.?secret != null), i => {
  name: i.name
  value: i.value
  secretRef: i.?secretRef ?? take(replace(replace(toLower(i.name), '_', '-'), '.', '-'), 32)
})
var mjolksyraApiEnv = map(filter(mjolksyraApiAppSettingsArray, i => i.?secret == null), i => {
  name: i.name
  value: i.value
})

module mjolksyraApi 'br/public:avm/res/app/container-app:0.8.0' = {
  name: 'mjolksyraApi'
  params: {
    name: apiContainerAppName
    ingressTargetPort: 8080
    corsPolicy: {
      allowedOrigins: [
        'https://${appContainerAppName}.${containerAppsEnvironment.outputs.defaultDomain}'
      ]
      allowedMethods: [
        '*'
      ]
    }
    customDomains: isProd
      ? [
          { name: 'a.mjolksyra.com', certificateId: managedCert.id }
        ]
      : []
    scaleMinReplicas: 0
    scaleMaxReplicas: 10
    secrets: {
      secureList: union(
        [],
        map(mjolksyraApiSecrets, secret => {
          name: secret.secretRef
          value: secret.value
        })
      )
    }
    containers: [
      {
        image: mjolksyraApiFetchLatestImage.outputs.?containers[?0].?image ?? 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
        name: 'main'
        resources: {
          cpu: json('0.5')
          memory: '1.0Gi'
        }
        env: union(
          [
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: monitoring.outputs.applicationInsightsConnectionString
            }
            {
              name: 'AZURE_CLIENT_ID'
              value: mjolksyraApiIdentity.outputs.clientId
            }
            {
              name: 'KEY_VAULT_URL'
              value: keyVaultApi.outputs.uri
            }
          ],
          mjolksyraApiEnv,
          map(mjolksyraApiSecrets, secret => {
            name: secret.name
            secretRef: secret.secretRef
          })
        )
      }
    ]
    managedIdentities: {
      systemAssigned: false
      userAssignedResourceIds: [mjolksyraApiIdentity.outputs.resourceId]
    }
    registries: [
      {
        server: containerRegistry.outputs.loginServer
        identity: mjolksyraApiIdentity.outputs.resourceId
      }
    ]
    environmentResourceId: containerAppsEnvironment.outputs.resourceId
    location: location
    tags: union(tags, { 'azd-service-name': 'mjolksyra-api' })
  }
}

resource managedCert 'Microsoft.App/managedEnvironments/managedCertificates@2024-03-01' = if (isProd) {
  name: '${abbrs.appManagedEnvironments}${resourceToken}/a.mjolksyra.com-cae-ygx5-250126123357'
  properties: {
    domainControlValidation: 'CNAME'
    subjectName: 'a.mjolksyra.com'
  }
  location: location
}

module mjolksyraAppIdentity 'br/public:avm/res/managed-identity/user-assigned-identity:0.2.1' = {
  name: 'mjolksyraAppidentity'
  params: {
    name: appIdentityName
    location: location
  }
}

module mjolksyraAppFetchLatestImage './modules/fetch-container-image.bicep' = {
  name: 'mjolksyraApp-fetch-image'
  params: {
    exists: mjolksyraAppExists
    name: appContainerAppName
  }
}

var mjolksyraAppAppSettingsArray = filter(array(mjolksyraAppDefinition.settings), i => i.name != '')
var mjolksyraAppSecrets = map(filter(mjolksyraAppAppSettingsArray, i => i.?secret != null), i => {
  name: i.name
  value: i.value
  secretRef: i.?secretRef ?? take(replace(replace(toLower(i.name), '_', '-'), '.', '-'), 32)
})
var mjolksyraAppEnv = map(filter(mjolksyraAppAppSettingsArray, i => i.?secret == null), i => {
  name: i.name
  value: i.value
})

module mjolksyraApp 'br/public:avm/res/app/container-app:0.8.0' = {
  name: 'mjolksyraApp'
  params: {
    name: appContainerAppName
    scaleMinReplicas: 0
    scaleMaxReplicas: 10
    secrets: {
      secureList: union(
        [],
        map(mjolksyraAppSecrets, secret => {
          name: secret.secretRef
          value: secret.value
        })
      )
    }
    containers: [
      {
        image: mjolksyraAppFetchLatestImage.outputs.?containers[?0].?image ?? 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
        name: 'main'
        resources: {
          cpu: json('0.5')
          memory: '1.0Gi'
        }
        env: union(
          [
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: monitoring.outputs.applicationInsightsConnectionString
            }
            {
              name: 'AZURE_CLIENT_ID'
              value: mjolksyraAppIdentity.outputs.clientId
            }
            {
              name: 'API_URL'
              value: 'https://${apiContainerAppName}.${containerAppsEnvironment.outputs.defaultDomain}'
            }
            {
              name: 'KEY_VAULT_URL'
              value: keyVaultApp.outputs.uri
            }
          ],
          mjolksyraAppEnv,
          map(mjolksyraAppSecrets, secret => {
            name: secret.name
            secretRef: secret.secretRef
          })
        )
      }
    ]
    managedIdentities: {
      systemAssigned: false
      userAssignedResourceIds: [mjolksyraAppIdentity.outputs.resourceId]
    }
    registries: [
      {
        server: containerRegistry.outputs.loginServer
        identity: mjolksyraAppIdentity.outputs.resourceId
      }
    ]
    environmentResourceId: containerAppsEnvironment.outputs.resourceId
    location: location
    tags: union(tags, { 'azd-service-name': 'mjolksyra-app' })
  }
}

module keyVaultApi 'br/public:avm/res/key-vault/vault:0.6.1' = {
  name: 'keyvault-api'
  params: {
    name: apiKeyVaultName
    location: location
    tags: tags
    enableRbacAuthorization: false
    accessPolicies: [
      {
        objectId: principalId
        permissions: {
          secrets: ['get', 'list']
        }
      }
      {
        objectId: mjolksyraApiIdentity.outputs.principalId
        permissions: {
          secrets: ['get', 'list']
        }
      }
    ]
    secrets: []
  }
}

module keyVaultApp 'br/public:avm/res/key-vault/vault:0.6.1' = {
  name: 'keyvault-app'
  params: {
    name: appKeyVaultName
    location: location
    tags: tags
    enableRbacAuthorization: false
    accessPolicies: [
      {
        objectId: principalId
        permissions: {
          secrets: ['get', 'list']
        }
      }
      {
        objectId: mjolksyraAppIdentity.outputs.principalId
        permissions: {
          secrets: ['get', 'list']
        }
      }
    ]
    secrets: []
  }
}
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerRegistry.outputs.loginServer
output AZURE_RESOURCE_MJOLKSYRA_API_ID string = mjolksyraApi.outputs.resourceId
output AZURE_RESOURCE_MJOLKSYRA_APP_ID string = mjolksyraApp.outputs.resourceId
