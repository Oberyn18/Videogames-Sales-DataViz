import numpy as np
import pandas as pd 

# Import data using pandas
data = pd.read_csv("vgsales.csv")
#data.info()

# Drop NaN values
data.dropna(how="any", inplace=True)

# Change data type on Year attribute
data.Year = data.Year.astype(int)
data.info()
