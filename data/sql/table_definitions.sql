IF OBJECT_ID('dbo.FactKegInstall', 'U') IS NOT NULL 
  DROP TABLE dbo.FactKegInstall; 

IF OBJECT_ID('dbo.DimKeg', 'U') IS NOT NULL 
  DROP TABLE dbo.DimKeg; 

IF OBJECT_ID('dbo.DimTap', 'U') IS NOT NULL 
  DROP TABLE dbo.DimTap; 

CREATE TABLE dbo.DimKeg(
 Id INT IDENTITY(1,1) NOT NULL,
 Name nvarchar(500) NOT NULL,
 Brewery nvarchar(500) NULL,
 BeerType nvarchar(100) NULL,
 ABV decimal NULL,
 IBU INT NULL,
 BeerDescription nvarchar(4000) NULL,
 UntappdId INT NULL,
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
 IsCurrent bit NOT NULL,
 CONSTRAINT pk_factKegInstall PRIMARY KEY(Id),
 CONSTRAINT fk_dimKeg FOREIGN KEY(KegId) REFERENCES dbo.dimKeg(Id),
 CONSTRAINT fk_dimTap FOREIGN KEY(TapId) REFERENCES dbo.dimTap(Id)
)

INSERT INTO dbo.DimTap VALUES ('Left')
INSERT INTO dbo.DimTap VALUES ('Right')

INSERT INTO dbo.DimKeg (Name, Brewery, BeerType, ABV, IBU, BeerDescription) VALUES ('Duvel Single', 'Duvel Moortgat Brewery', 'Belgian Blond', 8.5, 0, 'A Duvel is still seen as the reference among strong golden ales. Its bouquet is lively and tickles the nose with an element of citrus which even tends towards grapefruit thanks to the use of only the highest-quality hop varieties. This is also reflected in the flavour, which is beautifully balanced with a hint of spiciness. Thanks to its high CO2 content, this beer has a wonderful roundness in the mouth. A Duvel is both the perfect thirst quencher and the ideal aperitif.')
INSERT INTO dbo.DimKeg (Name, Brewery, BeerType, ABV, IBU, BeerDescription) VALUES ('Mack & Jack''s IBIS IPA', 'Mack & Jack''s Brewery', 'IPA', 6.9, 65, 'An aromatic blast of hops greets the nose when tasting this meticulously dry hopped IPA. Highly sought after Amarillo and Mosaic hops lend this beer its delicious tropical fruit nuanced flavor reminiscent of passion fruit and pineapple. Ibis finishes beautifully with a subtle, yet solid golden-hued malt body.')
INSERT INTO dbo.DimKeg (Name, Brewery, BeerType, ABV, IBU, BeerDescription) VALUES ('Men''s Room Original Red', 'Elysian Brewing Company', 'Amber Ale', 5.6, 51, 'Amber in color with a light hop aroma and toasty malt finish.')
INSERT INTO dbo.DimKeg (Name, Brewery, BeerType, ABV, IBU, BeerDescription) VALUES ('Bill Berry''s Winter Warmer', 'Zookeeper Brewery', 'Winter Ale', 8.2, 44, 'The All Grain Home Brew has it''s foundations as a clone of New Belgium''s 2 Below Winter Ale. The beer pours a dirty unfiltered and muted copper, with a frothy Antique White head; it drinks with ease.  An initial taste yields notes of pepper, damp earth, bread, toffee, butter and toasted malts.  It finishes with an almost cloying caramel sweetness and citrus overtone, while hints of fresh cut grass linger on the pallet.')


INSERT INTO dbo.FactKegInstall VALUES (1, '2017-01-05 15:00:00', 1, 0)
INSERT INTO dbo.FactKegInstall VALUES (2, '2017-01-11 14:30:00', 2, 0)
INSERT INTO dbo.FactKegInstall VALUES (3, '2017-01-18 15:30:00', 1, 1)
INSERT INTO dbo.FactKegInstall VALUES (4, '2017-01-23 12:00:00', 2, 1)