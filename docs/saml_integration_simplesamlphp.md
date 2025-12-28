# UC SimpleSAMLphp SAML Integration Strategy

**Document Version:** 1.0  
**Created:** 2025-12-27  
**Status:** Implementation Guide

## Executive Summary

UC's identity infrastructure uses **SimpleSAMLphp** (not Shibboleth) for its SAML 2.0 Identity Provider proxy. This document outlines the local development setup and integration strategy for the UCSC Assessment Hub based on this discovery.

## UC SAML Architecture Analysis

### Software Stack

**IdP Software:** SimpleSAMLphp  
**Evidence:** URL pattern `https://idpproxy-ucpath.universityofcalifornia.edu/simplesaml/` confirms SimpleSAMLphp deployment

**IdP Proxy Host:** `idpproxy-ucpath.universityofcalifornia.edu`  
**Discovery Service:** Custom `ucpathdiscovery` module (campus selection interface)  
**Protocol:** SAML 2.0 with InCommon Federation

### Critical Production Endpoints

| Endpoint Type | Production URL |
|---------------|----------------|
| **IdP Metadata** | `https://idpproxy-ucpath.universityofcalifornia.edu/simplesaml/saml2/idp/metadata.php` |
| **SSO Service** | `https://idpproxy-ucpath.universityofcalifornia.edu/simplesaml/saml2/idp/SSOService.php` |
| **Discovery Service** | `https://idpproxy-ucpath.universityofcalifornia.edu/simplesaml/module.php/ucpathdiscovery/disco.php` |
| **Service Provider (UCPath)** | `https://ucpath.universityofcalifornia.edu` |

### InCommon Entity IDs

UC campuses are federated via InCommon with standardized entity ID format:

- **UC Berkeley:** `urn:mace:incommon:berkeley.edu`
- **UC Davis:** `urn:mace:incommon:ucdavis.edu`
- **UCSC (expected):** `urn:mace:incommon:ucsc.edu`

**InCommon MDQ Service:** `http://mdq.incommon.org/entities/urn%3Amace%3Aincommon%3Aucsc.edu`

## Local Development Strategy

### Recommended Test IdP: kristophjunge/test-saml-idp

**Rationale:** This Docker image uses SimpleSAMLphp, providing **exact software parity** with UC's production infrastructure. Testing against the same SAML implementation ensures:

- Identical assertion format and structure
- Matching attribute release patterns
- Compatible metadata schema
- Consistent SAML endpoint behaviors
- Accurate certificate handling

### Docker Setup

```bash
docker run -d -p 8080:8080 -p 8443:8443 \
  --name ucsc-test-idp \
  -e SIMPLESAMLPHP_SP_ENTITY_ID=http://localhost:3000 \
  -e SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE=http://localhost:3000/auth/saml/callback \
  kristophjunge/test-saml-idp
```

### Local Endpoint Mapping

| Endpoint Type | Local Development URL |
|---------------|----------------------|
| **IdP Metadata** | `http://localhost:8080/simplesaml/saml2/idp/metadata.php` |
| **SSO Service** | `http://localhost:8080/simplesaml/saml2/idp/SSOService.php` |
| **Admin Interface** | `http://localhost:8080/simplesaml/` (username: `admin`, password: `secret`) |

### Test User Credentials

**Default test users** (from kristophjunge image):

- **Username:** `user1` / `user2`
- **Password:** `user1pass` / `user2pass`

## UC eduPerson Attribute Schema

To match UC's expected SAML attribute release, configure the test IdP to return these attributes:

| Attribute Name | Description | Example Value |
|----------------|-------------|---------------|
| `uid` | Campus username | `jdoe` |
| `mail` | Email address | `jdoe@ucsc.edu` |
| `eduPersonPrincipalName` | Scoped identifier | `jdoe@ucsc.edu` |
| `eduPersonAffiliation` | User affiliation(s) | `member`, `student`, `faculty`, `staff`, `employee` |
| `givenName` | First name | `John` |
| `sn` | Surname (last name) | `Doe` |
| `displayName` | Full display name | `John Doe` |

### Custom Attribute Configuration

To configure custom attributes, mount a custom `authsources.php` file:

```bash
docker run -d -p 8080:8080 -p 8443:8443 \
  --name ucsc-test-idp \
  -v $(pwd)/config/authsources.php:/var/www/simplesamlphp/config/authsources.php \
  -e SIMPLESAMLPHP_SP_ENTITY_ID=http://localhost:3000 \
  -e SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE=http://localhost:3000/auth/saml/callback \
  kristophjunge/test-saml-idp
```

**Example `authsources.php` snippet:**

```php
<?php
$config = [
    'admin' => [
        'core:AdminPassword',
    ],
    'example-userpass' => [
        'exampleauth:UserPass',
        'student1:password' => [
            'uid' => ['student1'],
            'mail' => ['student1@ucsc.edu'],
            'eduPersonPrincipalName' => ['student1@ucsc.edu'],
            'eduPersonAffiliation' => ['member', 'student'],
            'givenName' => ['Jane'],
            'sn' => ['Student'],
            'displayName' => ['Jane Student'],
        ],
        'instructor1:password' => [
            'uid' => ['instructor1'],
            'mail' => ['instructor1@ucsc.edu'],
            'eduPersonPrincipalName' => ['instructor1@ucsc.edu'],
            'eduPersonAffiliation' => ['member', 'faculty', 'employee'],
            'givenName' => ['John'],
            'sn' => ['Instructor'],
            'displayName' => ['John Instructor'],
        ],
    ],
];
```

## Assessment Hub Service Provider Configuration

### Required SAML Library

**Recommended:** `@node-saml/passport-saml` (Node.js/TypeScript)

```bash
pnpm add @node-saml/passport-saml passport --filter portal
pnpm add -D @types/passport --filter portal
```

### Service Provider Metadata

Your Assessment Hub will need to provide SP metadata at:

```
http://localhost:3000/auth/saml/metadata
```

**Required SP metadata elements:**

- **Entity ID:** `http://localhost:3000` (or production domain)
- **Assertion Consumer Service (ACS) URL:** `http://localhost:3000/auth/saml/callback`
- **NameID Format:** `urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress`
- **Certificate:** X.509 certificate for assertion encryption (optional for testing)

### Environment Variables

Add to `.env`:

```bash
# SAML Configuration (Local Development)
VITE_SAML_ENTRY_POINT=http://localhost:8080/simplesaml/saml2/idp/SSOService.php
VITE_SAML_IDP_METADATA_URL=http://localhost:8080/simplesaml/saml2/idp/metadata.php
VITE_SAML_CALLBACK_URL=http://localhost:3000/auth/saml/callback
VITE_SAML_ISSUER=http://localhost:3000
VITE_SAML_ENTITY_ID=http://localhost:3000

# SAML Configuration (Production - to be updated)
# VITE_SAML_ENTRY_POINT=https://idpproxy-ucpath.universityofcalifornia.edu/simplesaml/saml2/idp/SSOService.php
# VITE_SAML_IDP_METADATA_URL=https://idpproxy-ucpath.universityofcalifornia.edu/simplesaml/saml2/idp/metadata.php
# VITE_SAML_CALLBACK_URL=https://assessments.ucsc.edu/auth/saml/callback
# VITE_SAML_ISSUER=https://assessments.ucsc.edu
# VITE_SAML_ENTITY_ID=https://assessments.ucsc.edu
```

## Implementation Phases

### Phase 1: Local SAML Testing (Current Phase)

**Objectives:**
- ✅ Start kristophjunge/test-saml-idp container
- ⬜ Install `@node-saml/passport-saml` in portal app
- ⬜ Create SAML authentication routes (`/auth/saml/login`, `/auth/saml/callback`, `/auth/saml/metadata`)
- ⬜ Parse SAML assertions and extract attributes
- ⬜ Map SAML attributes to User model in `@ucsc-hub/auth`
- ⬜ Test authentication flow end-to-end locally

### Phase 2: UCSC Integration Preparation

**Objectives:**
- ⬜ Contact UCSC IT to obtain production metadata URL
- ⬜ Register Assessment Hub as Service Provider with UCSC IT
- ⬜ Provide SP metadata to UCSC IT for registration
- ⬜ Request attribute release policy (which attributes will be released)
- ⬜ Obtain production entity ID and endpoints
- ⬜ Generate production SSL certificates for SAML signing

### Phase 3: Production Deployment

**Objectives:**
- ⬜ Update environment variables to use production UCSC endpoints
- ⬜ Test SAML flow in staging environment
- ⬜ Configure session persistence (Redis/database-backed sessions)
- ⬜ Implement logout (Single Logout - SLO)
- ⬜ Add monitoring and error handling for SAML failures
- ⬜ Document troubleshooting procedures

## Role Mapping Strategy

Map `eduPersonAffiliation` values to Assessment Hub roles:

| eduPersonAffiliation | Assessment Hub Role | Permissions |
|----------------------|---------------------|-------------|
| `student` | `student` | View assessments, submit responses |
| `faculty` | `instructor` | Create/manage assessments, view results |
| `staff` (with specific OU) | `staff` or `admin` | Administrative functions |
| `employee` | `staff` | Support functions |

**Implementation Note:** Role mapping logic should be in `libs/auth/src/utils/roleMapper.ts`

## Security Considerations

### Certificate Management

- Generate self-signed certificates for local testing
- Use proper SSL certificates from UC/InCommon for production
- Rotate certificates before expiration (typically 1-year validity)
- Store private keys securely (AWS Secrets Manager, HashiCorp Vault, etc.)

### Session Security

- Use secure, HTTP-only cookies for session tokens
- Implement CSRF protection on SAML callback endpoint
- Set appropriate session timeout (align with UC's 30-minute idle timeout)
- Validate SAML assertion signatures
- Check assertion timestamps and NotBefore/NotOnOrAfter conditions

### Attribute Validation

- Validate `eduPersonPrincipalName` format (`username@ucsc.edu`)
- Verify affiliation values against expected set
- Implement fallback for missing optional attributes
- Log attribute parsing failures for debugging

## Testing Checklist

### Local Testing (with kristophjunge/test-saml-idp)

- [ ] Start test IdP container successfully
- [ ] Access IdP metadata endpoint
- [ ] Initiate SP-initiated SAML login flow
- [ ] Successfully authenticate with test credentials
- [ ] Receive SAML assertion with expected attributes
- [ ] Parse assertion and extract all attributes correctly
- [ ] Create user session in Assessment Hub
- [ ] Display user name and role on dashboard
- [ ] Test logout flow
- [ ] Handle SAML errors gracefully (expired assertion, invalid signature, etc.)

### Integration Testing (with UCSC Production IdP)

- [ ] Fetch production IdP metadata successfully
- [ ] Register SP metadata with UCSC IT
- [ ] Test authentication with real UCSC credentials
- [ ] Verify all expected attributes are released
- [ ] Test with multiple user types (student, faculty, staff)
- [ ] Test campus selection via discovery service
- [ ] Verify session persistence across page refreshes
- [ ] Test session timeout behavior
- [ ] Test Single Logout (SLO) if supported by UCSC

## Troubleshooting

### Common Issues

**Issue:** `SAML assertion signature validation failed`  
**Solution:** Ensure IdP certificate in metadata matches the signing certificate used by IdP

**Issue:** `No attributes received in SAML assertion`  
**Solution:** Check attribute release policy with UCSC IT; verify SP metadata includes requested attributes

**Issue:** `Invalid destination in SAML response`  
**Solution:** Verify ACS URL in SP metadata matches callback URL configuration

**Issue:** `Session not persisting after SAML login`  
**Solution:** Check cookie settings (SameSite, Secure, Domain); verify session store configuration

## References

### UC Documentation

- UC Berkeley CalNet SAML Setup: https://calnet.berkeley.edu/calnet-technologists/single-sign/shibboleth/how-setup-ssosaml-your-service
- UC Davis IdP Metadata: https://ucdavis.jira.com/wiki/display/IETP/Obtaining+a+Trusted+Copy+of+the+UC+Davis+IdP+SAML+Metadata

### SimpleSAMLphp Documentation

- IdP Hosted Setup: https://simplesamlphp.org/docs/stable/simplesamlphp-idp.html
- Metadata Endpoints: https://simplesamlphp.org/docs/stable/simplesamlphp-metadata-endpoints.html

### InCommon Federation

- InCommon Federation Metadata: https://incommon.org/federation/metadata/
- Entity ID Best Practices: https://spaces.at.internet2.edu/display/federation/saml-metadata-entityid

### Docker Test IdP

- kristophjunge/test-saml-idp: https://hub.docker.com/r/kristophjunge/test-saml-idp

## Next Steps

1. Start kristophjunge/test-saml-idp container locally
2. Install SAML dependencies in portal app
3. Create SAML authentication routes and handlers
4. Test local SAML authentication flow
5. Contact UCSC IT (identity-management@ucsc.edu) to initiate SP registration process
6. Update this document with UCSC-specific configuration details as they become available

## Contacts

**UCSC IT Identity Management:** identity-management@ucsc.edu (verify actual contact)  
**InCommon Support:** support@incommon.org
