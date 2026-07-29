# KSP Crime Intelligence AI — Catalyst DataStore Schema Reference

> Generated: 2026-07-28T16:01:03.923Z

> Total Tables: 26


## State (State)

- **Type:** master
- **Primary Key:** StateID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| StateID | bigint | NO | — | — |
| StateName | text(200) | NO | — | ✓ |
| NationalityID | bigint | YES | — | — |
| Active | boolean | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## UnitType (Unit Type)

- **Type:** lookup
- **Primary Key:** UnitTypeID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| UnitTypeID | bigint | NO | — | — |
| UnitTypeName | text(200) | NO | — | — |
| CityDistState | text(50) | YES | — | — |
| Hierarchy | bigint | YES | — | — |
| Active | boolean | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## Rank (Police Rank)

- **Type:** lookup
- **Primary Key:** RankID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| RankID | bigint | NO | — | — |
| RankName | text(200) | NO | — | — |
| Hierarchy | bigint | YES | — | — |
| Active | boolean | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## Designation (Designation)

- **Type:** lookup
- **Primary Key:** DesignationID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| DesignationID | bigint | NO | — | — |
| DesignationName | text(200) | NO | — | — |
| Active | boolean | NO | — | — |
| SortOrder | bigint | YES | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## CasteMaster (Caste Master)

- **Type:** lookup
- **Primary Key:** caste_master_id

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| caste_master_id | bigint | NO | — | — |
| caste_master_name | text(200) | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## ReligionMaster (Religion Master)

- **Type:** lookup
- **Primary Key:** ReligionID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| ReligionID | bigint | NO | — | — |
| ReligionName | text(200) | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## OccupationMaster (Occupation Master)

- **Type:** lookup
- **Primary Key:** OccupationID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| OccupationID | bigint | NO | — | — |
| OccupationName | text(200) | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## CaseStatusMaster (Case Status)

- **Type:** lookup
- **Primary Key:** CaseStatusID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| CaseStatusID | bigint | NO | — | — |
| CaseStatusName | text(200) | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## CaseCategory (Case Category)

- **Type:** lookup
- **Primary Key:** CaseCategoryID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| CaseCategoryID | bigint | NO | — | — |
| LookupValue | text(100) | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## GravityOffence (Offence Gravity)

- **Type:** lookup
- **Primary Key:** GravityOffenceID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| GravityOffenceID | bigint | NO | — | — |
| LookupValue | text(200) | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## CrimeHead (Major Crime Category)

- **Type:** lookup
- **Primary Key:** CrimeHeadID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| CrimeHeadID | bigint | NO | — | — |
| CrimeGroupName | text(500) | NO | — | ✓ |
| Active | boolean | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## Act (Legal Act)

- **Type:** master
- **Primary Key:** ActCode

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| ActCode | text(50) | NO | — | ✓ |
| ActDescription | text(1000) | NO | — | — |
| ShortName | text(100) | YES | — | — |
| Active | boolean | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## District (District)

- **Type:** master
- **Primary Key:** DistrictID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| DistrictID | bigint | NO | — | — |
| DistrictName | text(200) | NO | — | ✓ |
| StateID | bigint | NO | State.StateID | ✓ |
| Active | boolean | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## CrimeSubHead (Crime Sub-Head)

- **Type:** transaction
- **Primary Key:** CrimeSubHeadID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| CrimeSubHeadID | bigint | NO | — | — |
| CrimeHeadID | bigint | NO | CrimeHead.CrimeHeadID | ✓ |
| CrimeHeadName | text(500) | NO | — | — |
| SeqID | bigint | YES | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## Section (Act Section)

- **Type:** master
- **Primary Key:** SectionCode

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| ActCode | text(50) | NO | Act.ActCode | ✓ |
| SectionCode | text(100) | NO | — | ✓ |
| SectionDescription | text(2000) | YES | — | — |
| Active | boolean | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## Court (Court)

- **Type:** master
- **Primary Key:** CourtID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| CourtID | bigint | NO | — | — |
| CourtName | text(500) | NO | — | — |
| DistrictID | bigint | YES | District.DistrictID | ✓ |
| StateID | bigint | YES | State.StateID | — |
| Active | boolean | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## Unit (Police Unit / Station)

- **Type:** master
- **Primary Key:** UnitID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| UnitID | bigint | NO | — | ✓ |
| UnitName | text(500) | NO | — | — |
| TypeID | bigint | YES | UnitType.UnitTypeID | — |
| ParentUnit | bigint | YES | — | — |
| NationalityID | bigint | YES | — | — |
| StateID | bigint | YES | State.StateID | — |
| DistrictID | bigint | YES | District.DistrictID | ✓ |
| Active | boolean | NO | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## Employee (Police Officer / Employee)

- **Type:** master
- **Primary Key:** EmployeeID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| EmployeeID | bigint | NO | — | ✓ |
| DistrictID | bigint | YES | District.DistrictID | ✓ |
| UnitID | bigint | YES | Unit.UnitID | ✓ |
| RankID | bigint | YES | Rank.RankID | — |
| DesignationID | bigint | YES | Designation.DesignationID | — |
| KGID | text(50) | YES | — | — |
| FirstName | text(200) | NO | — | — |
| EmployeeDOB | text(20) | YES | — | — |
| GenderID | bigint | YES | — | — |
| BloodGroupID | bigint | YES | — | — |
| PhysicallyChallenged | boolean | YES | — | — |
| AppointmentDate | text(20) | YES | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## CaseMaster (Case File (FIR))

- **Type:** transaction
- **Primary Key:** CaseMasterID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| CaseMasterID | bigint | NO | — | ✓ |
| CrimeNo | text(100) | YES | — | ✓ |
| CaseNo | text(100) | YES | — | ✓ |
| CrimeRegisteredDate | text(30) | YES | — | — |
| PolicePersonID | bigint | YES | Employee.EmployeeID | ✓ |
| PoliceStationID | bigint | YES | Unit.UnitID | ✓ |
| CaseCategoryID | bigint | YES | CaseCategory.CaseCategoryID | — |
| GravityOffenceID | bigint | YES | GravityOffence.GravityOffenceID | — |
| CrimeMajorHeadID | bigint | YES | CrimeHead.CrimeHeadID | ✓ |
| CrimeMinorHeadID | bigint | YES | CrimeSubHead.CrimeSubHeadID | ✓ |
| CaseStatusID | bigint | YES | CaseStatusMaster.CaseStatusID | ✓ |
| CourtID | bigint | YES | Court.CourtID | — |
| IncidentFromDate | text(30) | YES | — | — |
| IncidentToDate | text(30) | YES | — | — |
| InfoReceivedPSDate | text(30) | YES | — | — |
| latitude | double | YES | — | — |
| longitude | double | YES | — | — |
| BriefFacts | text(10000) | YES | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## ComplainantDetails (Complainant Details)

- **Type:** transaction
- **Primary Key:** ComplainantID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| ComplainantID | bigint | NO | — | — |
| CaseMasterID | bigint | NO | CaseMaster.CaseMasterID | ✓ |
| ComplainantName | text(300) | NO | — | — |
| AgeYear | bigint | YES | — | — |
| OccupationID | bigint | YES | OccupationMaster.OccupationID | — |
| ReligionID | bigint | YES | ReligionMaster.ReligionID | — |
| CasteID | bigint | YES | CasteMaster.caste_master_id | — |
| GenderID | bigint | YES | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## Victim (Victim Details)

- **Type:** transaction
- **Primary Key:** VictimMasterID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| VictimMasterID | bigint | NO | — | — |
| CaseMasterID | bigint | NO | CaseMaster.CaseMasterID | ✓ |
| VictimName | text(300) | NO | — | — |
| AgeYear | bigint | YES | — | — |
| GenderID | bigint | YES | — | — |
| VictimPolice | text(10) | YES | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## Accused (Accused Details)

- **Type:** transaction
- **Primary Key:** AccusedMasterID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| AccusedMasterID | bigint | NO | — | — |
| CaseMasterID | bigint | NO | CaseMaster.CaseMasterID | ✓ |
| AccusedName | text(300) | NO | — | — |
| AgeYear | bigint | YES | — | — |
| GenderID | bigint | YES | — | — |
| PersonID | text(20) | YES | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## ChargesheetDetails (Chargesheet Details)

- **Type:** transaction
- **Primary Key:** CSID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| CSID | bigint | NO | — | — |
| CaseMasterID | bigint | NO | CaseMaster.CaseMasterID | ✓ |
| csdate | text(30) | YES | — | — |
| cstype | text(5) | YES | — | — |
| PolicePersonID | bigint | YES | Employee.EmployeeID | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## ArrestSurrender (Arrest / Surrender Record)

- **Type:** transaction
- **Primary Key:** ArrestSurrenderID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| ArrestSurrenderID | bigint | NO | — | — |
| CaseMasterID | bigint | NO | CaseMaster.CaseMasterID | ✓ |
| ArrestSurrenderTypeID | bigint | YES | — | — |
| ArrestSurrenderDate | text(30) | YES | — | — |
| ArrestSurrenderStateId | bigint | YES | State.StateID | — |
| ArrestSurrenderDistrictId | bigint | YES | District.DistrictID | — |
| PoliceStationID | bigint | YES | Unit.UnitID | — |
| IOID | bigint | YES | Employee.EmployeeID | — |
| CourtID | bigint | YES | Court.CourtID | — |
| AccusedMasterID | bigint | YES | Accused.AccusedMasterID | — |
| IsAccused | boolean | YES | — | — |
| IsComplainantAccused | boolean | YES | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## ActSectionAssociation (FIR Act-Section Links)

- **Type:** junction
- **Primary Key:** AssociationID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| AssociationID | bigint | NO | — | — |
| CaseMasterID | bigint | NO | CaseMaster.CaseMasterID | ✓ |
| ActID | text(50) | NO | Act.ActCode | — |
| SectionID | text(100) | NO | Section.SectionCode | — |
| ActOrderID | bigint | YES | — | — |
| SectionOrderID | bigint | YES | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |

## CrimeHeadActSection (Crime Head ↔ Act Section Map)

- **Type:** junction
- **Primary Key:** MappingID

| Column | Catalyst Type | Nullable | FK Reference | Indexed |
|--------|--------------|----------|-------------|---------|
| MappingID | bigint | NO | — | — |
| CrimeHeadID | bigint | NO | CrimeHead.CrimeHeadID | ✓ |
| ActCode | text(50) | NO | Act.ActCode | — |
| SectionCode | text(100) | YES | — | — |
| created_at | text(30) | YES | — | — |
| updated_at | text(30) | YES | — | — |
| created_by | text(200) | YES | — | — |
| updated_by | text(200) | YES | — | — |
| is_active | boolean | YES | — | — |
