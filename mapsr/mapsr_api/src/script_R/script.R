x = function(outputFileName,fcar_farm, biomas_farm, app_farm, car_farm) {

# x = function(myData) {
  #myData = "teste_arquivo"
 
  # clean 
  #rm(list=ls())
  A = c( "outputFileName", "fcar_farm", "biomas_farm", "app_farm", "car_farm" )

    #remove all objects in memory, except myData
  rm(list=setdiff(ls(), A))
  # hora = Sys.time()
  #name of file based in myData var
  fileName = outputFileName;
  print(fileName)
   
  #  import packages packages
  library(abind)
  library(geosphere)
  library(ggplot2)
  library(raster)
  library(sf)
  library(sp)
  library(stars)
  library(rgeos)
  # farm car
  fcar= fcar_farm;
  # fcar= "SP-3548906-13CBFC3115AD49A9B51FC014A701B019"
  # set main folder [change here accordingly]
  # root= "/Users/macboook/Projetos Dev/R/api_projetoR/storage/"
  # root= "/mnt/volume_mapsr_11may22/mapsr/storege/"

  rootOutput = paste0(root,"output/")
  # rootOutput = paste0(root,"output/")
  # upload car
  car= st_read(paste0(root, car_farm))
  # car= st_read(paste0(root, "input/imovel/imovel.shp"))
  # keep one farm
  farm= car[car$COD_IMOVEL==fcar,]
  # remove used objects
  remove(car)
  # upload app
  app= st_read(paste0(root, app_farm))
  # app= st_read(paste0(root, "input/app/app.shp"))
  # rename column
  names(app)[3]= "NUM_AREA_APP"
  # set tif path
  tifpath= paste0(root, biomas_farm)
  # tifpath= paste0(root, "/input/mapbiomas/mapbiomas2020.tif")
  # read tiff with stars package
  tif=read_stars(tifpath)
  # upload tif as simple features class
  mapbiomas=st_as_sf(tif)
  # set same projection [!]
  mapbiomas= st_transform(mapbiomas, crs= st_crs(farm))
  # rename main columns
  colnames(mapbiomas)[1]= "bioma_code" 
  # remove used objects
  remove(tifpath, tif)
  
  # map intersection: farm and app [!]
  sf_use_s2(FALSE)
  appfarm= st_intersection(x= farm, y= app)
  
  # map intersection: farm and mapbiomas [!]
  farmappbiomas= st_intersection(x= appfarm, y= mapbiomas)
  # remove used objects
  remove(app, farm, mapbiomas)
  # set forest dummy
  farmappbiomas$forest_dummy= ifelse(farmappbiomas$bioma_code<13, 1, 0)
  # set dataframe
  df= data.frame("","","" )
  # name columns
  names(df)= c("farm_car", "app_area", "forest_area_in_app" )
  # fill farm code
  df$farm_car= fcar
  # remove used objects
  remove(fcar)
  # fill app area
  df$app_area= as.numeric(sum(st_area(appfarm, na.rm=TRUE))/10000)
  # remove used objects
  remove(appfarm)
  # fill forest area
  df$forest_area_in_app= as.numeric(sum(st_area(subset(farmappbiomas, farmappbiomas$forest_dummy==1), na.rm=TRUE))/10000)
  # fill forest cover deficit
  df$forest_deficit= df$forest_area_in_app - df$app_area
  # output 1: .csv file (main data)
  verifyFileExist <-  paste0(rootOutput, fileName, ".csv")
  if(file.exists(verifyFileExist)){
file.remove(verifyFileExist)
  }
 remove(verifyFileExist)
  
  write.csv2(df, paste0(rootOutput, fileName, ".csv"))
  
  
  #filtering farmappbiomas by only POLYGON
  farmappbiomasPolygon <- st_collection_extract(farmappbiomas, "POLYGON")
  

  verifyFileExist <- paste0(rootOutput, fileName, ".shp")
  if(file.exists(verifyFileExist)){
file.remove(verifyFileExist)
file.remove(paste0(rootOutput, fileName, ".shx"))
file.remove(paste0(rootOutput, fileName, ".dbf"))
file.remove(paste0(rootOutput, fileName, ".prj"))
  }
 remove(verifyFileExist)
  
  shape <- st_write(farmappbiomasPolygon, paste0(rootOutput, fileName, ".shp"), overwrite=T)
  
  #Generate pdf
  # verify if exist file
verifyFileExist <- paste0(rootOutput, fileName, ".pdf")
  if(file.exists(verifyFileExist)){
file.remove(verifyFileExist)
  }
 remove(verifyFileExist)
pdf(paste0(rootOutput, fileName, ".pdf"))
p1 <- ggplot(data= farmappbiomas) + 
    geom_sf(mapping= aes(fill= factor(forest_dummy))) +
    theme_minimal()
p1
  dev.off()
  
  ggsave(paste0(rootOutput, fileName, ".pdf"), p1)
  result <- fileName
  # remove used objects
  remove(root)
  remove(df)
  remove(farmappbiomas)
  remove(farmappbiomasPolygon)
  remove(fileName)
  remove(rootOutput)
  remove(myData)
  remove(shape)
  remove(p1)
print(result)
  # code end

}
