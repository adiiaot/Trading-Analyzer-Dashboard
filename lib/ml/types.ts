export interface MLLayer {
  weights: number[][];
  bias: number[];
  activation: 'relu' | 'sigmoid';
}

export interface MLModel {
  feature_names: string[];
  mean: number[];
  std: number[];
  layers: MLLayer[];
  metadata: {
    version: string;
    trained_on: string;
    accuracy: number;
    precision: number;
    recall: number;
    win_rate_at_threshold: number;
    decision_threshold: number;
  };
}
