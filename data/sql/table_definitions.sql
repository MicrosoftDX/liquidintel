IF OBJECT_ID('dbo.FactKegInstall', 'U') IS NOT NULL 
  DROP TABLE dbo.FactKegInstall; 

IF OBJECT_ID('dbo.FactDrinkers', 'U') IS NOT NULL 
  DROP TABLE dbo.FactDrinkers; 

IF OBJECT_ID('dbo.DimKeg', 'U') IS NOT NULL 
  DROP TABLE dbo.DimKeg; 

IF OBJECT_ID('dbo.DimTap', 'U') IS NOT NULL 
  DROP TABLE dbo.DimTap; 

IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL 
  DROP TABLE dbo.Users; 

IF OBJECT_ID('dbo.GetValidPeople', 'U') IS NOT NULL
  DROP PROCEDURE dbo.GetValidPeople

IF TYPE_ID('dbo.EmailAliases') IS NOT NULL  
  DROP TYPE dbo.EmailAliases;

CREATE TYPE dbo.EmailAliases AS TABLE
(
	EmailAlias varchar(30)
)

CREATE TABLE dbo.DimKeg(
 Id INT IDENTITY(1,1) NOT NULL,
 Name nvarchar(500) NOT NULL,
 Brewery nvarchar(500) NULL,
 BeerType nvarchar(100) NULL,
 ABV decimal(18,1) NULL,
 IBU INT NULL,
 BeerDescription nvarchar(4000) NULL,
 UntappdId INT NULL,
 imagePath nvarchar(4000) NULL,
 CONSTRAINT pk_dimKeg PRIMARY KEY(Id)
)

CREATE TABLE dbo.DimTap(
 Id INT IDENTITY(1,1) NOT NULL,
 [Desc] nvarchar(100) NOT NULL,
 CONSTRAINT pk_dimTap PRIMARY KEY(Id)
)

CREATE TABLE dbo.FactKegInstall (
 Id INT IDENTITY(1,1) NOT NULL,
 KegId INT NOT NULL,
 InstallDate datetime2 NOT NULL,
 TapId INT NOT NULL,
 kegSizeInML INT NOT NULL,
 currentVolumeInML INT NOT NULL,
 IsCurrent bit NOT NULL,
 CONSTRAINT pk_factKegInstall PRIMARY KEY(Id),
 CONSTRAINT fk_dimKeg FOREIGN KEY(KegId) REFERENCES dbo.DimKeg(Id),
 CONSTRAINT fk_dimTap FOREIGN KEY(TapId) REFERENCES dbo.DimTap(Id)
)

CREATE NONCLUSTERED INDEX IX_FactKegInstall_InstallDate  
ON dbo.FactKegInstall (InstallDate)  
INCLUDE (KegId, TapId); 

CREATE NONCLUSTERED INDEX IX_FactKegInstall_isCurrent 
ON dbo.FactKegInstall (isCurrent)  
INCLUDE (KegId, TapId);  


CREATE TABLE dbo.FactDrinkers(
 Id INT IDENTITY(1,1) NOT NULL,
 PourDateTime datetime2 NOT NULL,
 PersonnelNumber INT NOT NULL,
 TapId int NOT NULL,
 KegId int NOT NULL,
 PourAmountInML INT NULL,
 [UntappdCheckinId] int NULL,
 [UntappdBadgeName] nvarchar(500) NULL,
 [UntappdBadgeImageURL] nvarchar(1000) NULL,
 CONSTRAINT pk_FactDrinkers PRIMARY KEY(Id),
 CONSTRAINT fk_FactDrinkers_DimTap FOREIGN KEY(TapId) REFERENCES dbo.DimTap(Id),
 CONSTRAINT fk_FactDrinkers_DimKeg FOREIGN KEY(KegId) REFERENCES dbo.DimKeg(Id)
)

CREATE NONCLUSTERED INDEX IX_FactDrinkers_PourDateTime
ON dbo.FactDrinkers (PourDateTime)
INCLUDE (PersonnelNumber, TapId);

CREATE NONCLUSTERED INDEX IX_FactDrinkers_PersonnelNumber
ON dbo.FactDrinkers (PersonnelNumber)
INCLUDE (PourDateTime, TapId);

CREATE TABLE dbo.Users(
  PersonnelNumber INT NOT NULL PRIMARY KEY CLUSTERED,
  UserPrincipalName NVarChar(400) NOT NULL,
  UntappdUserName NVarChar(255),
  UntappdAccessToken NVarChar(1000),
  CheckinFacebook bit default(0),
  CheckinTwitter bit default(0),
  CheckinFoursquare bit default(0)
);

CREATE INDEX IX_Users_UPN
ON dbo.Users (UserPrincipalName);


CREATE INDEX IX_CARD02CardKeyMappingS_SAPPersonnelNbr
ON CARD02CardKeyMappingS
(
	SAPPersonnelNbr
)
INCLUDE (CardKeyNbr);

CREATE PROCEDURE GetValidPeople 
	@aliases EmailAliases readonly
AS
BEGIN
	SET NOCOUNT ON;

	SELECT p.[PersonnelNumber], p.[EmailName], p.[FullName], c.[CardKeyNbr]
	FROM HC01Person p INNER JOIN CARD02CardKeyMappingS c ON p.PersonnelNumber = c.SAPPersonnelNbr
	WHERE p.EmailName in (SELECT EmailAlias FROM @aliases);
END
GO


INSERT INTO dbo.DimTap VALUES ('Left')
INSERT INTO dbo.DimTap VALUES ('Right')

INSERT INTO dbo.DimKeg (Name, Brewery, BeerType, ABV, IBU, BeerDescription) VALUES ('Duvel Single', 'Duvel Moortgat Brewery', 'Belgian Blond', 8.5, 0, 'A Duvel is still seen as the reference among strong golden ales. Its bouquet is lively and tickles the nose with an element of citrus which even tends towards grapefruit thanks to the use of only the highest-quality hop varieties. This is also reflected in the flavour, which is beautifully balanced with a hint of spiciness. Thanks to its high CO2 content, this beer has a wonderful roundness in the mouth. A Duvel is both the perfect thirst quencher and the ideal aperitif.')
INSERT INTO dbo.DimKeg (Name, Brewery, BeerType, ABV, IBU, BeerDescription) VALUES ('Mack & Jack''s IBIS IPA', 'Mack & Jack''s Brewery', 'IPA', 6.9, 65, 'An aromatic blast of hops greets the nose when tasting this meticulously dry hopped IPA. Highly sought after Amarillo and Mosaic hops lend this beer its delicious tropical fruit nuanced flavor reminiscent of passion fruit and pineapple. Ibis finishes beautifully with a subtle, yet solid golden-hued malt body.')
INSERT INTO dbo.DimKeg (Name, Brewery, BeerType, ABV, IBU, BeerDescription) VALUES ('Men''s Room Original Red', 'Elysian Brewing Company', 'Amber Ale', 5.6, 51, 'Amber in color with a light hop aroma and toasty malt finish.')
INSERT INTO dbo.DimKeg (Name, Brewery, BeerType, ABV, IBU, BeerDescription) VALUES ('Bill Berry''s Winter Warmer', 'Zookeeper Brewery', 'Winter Ale', 8.2, 44, 'The All Grain Home Brew has it''s foundations as a clone of New Belgium''s 2 Below Winter Ale. The beer pours a dirty unfiltered and muted copper, with a frothy Antique White head; it drinks with ease.  An initial taste yields notes of pepper, damp earth, bread, toffee, butter and toasted malts.  It finishes with an almost cloying caramel sweetness and citrus overtone, while hints of fresh cut grass linger on the pallet.')

INSERT INTO dbo.FactKegInstall (KegId, InstallDate, TapId, kegSizeInML, currentVolumeInML, IsCurrent) VALUES (1, '2017-01-05 23:00:00', 1, 18928, 0, 0)
INSERT INTO dbo.FactKegInstall (KegId, InstallDate, TapId, kegSizeInML, currentVolumeInML, IsCurrent) VALUES (2, '2017-01-11 22:30:00', 2, 18928, 0, 0)
INSERT INTO dbo.FactKegInstall (KegId, InstallDate, TapId, kegSizeInML, currentVolumeInML, IsCurrent) VALUES (3, '2017-01-18 23:30:00', 1, 18928, 7030, 1)
INSERT INTO dbo.FactKegInstall (KegId, InstallDate, TapId, kegSizeInML, currentVolumeInML, IsCurrent) VALUES (4, '2017-01-23 20:00:00', 2, 18928, 10235, 1)

INSERT INTO dbo.Users (PersonnelNumber, UserPrincipalName) VALUES (52, 'dxliquie@microsoft.com');
INSERT INTO dbo.Users (PersonnelNumber, UserPrincipalName) VALUES (429986, 'dxliquif@microsoft.com');

INSERT INTO dbo.FactDrinkers (PourDateTime, PersonnelNumber, TapId, KegId, PourAmountInML) VALUES ('2017-02-14 00:35:19.0000000', 52, 1, 3, 127);
INSERT INTO dbo.FactDrinkers (PourDateTime, PersonnelNumber, TapId, KegId, PourAmountInML) VALUES ('2017-02-14 00:35:19.0000000', 52, 2, 4, 987);