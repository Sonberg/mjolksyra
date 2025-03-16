import { nextCosmosPage, nextCosmosStaticParams } from "react-cosmos-next";
import * as cosmosImports from "../../../cosmos.imports";
import { FC } from "react";

export const generateStaticParams = nextCosmosStaticParams(cosmosImports);

export default nextCosmosPage(cosmosImports) as FC;
